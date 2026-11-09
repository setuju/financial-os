import type { FastifyPluginAsync } from 'fastify';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'qwen/qwen3.8-27b';
const OCR_SPACE_URL = 'https://api.ocr.space/parse/image';
const MAX_BASE64_LENGTH = 3_000_000; // ~3MB base64 (~2.2MB image)
const UPSTREAM_TIMEOUT_MS = 30_000;

const VISION_PROMPT =
  'Extract from this receipt: what was bought and the total amount paid. ' +
  'Output ONE short natural-language sentence like: "spent 9 dollars on coffee at Kopi Kenangan". ' +
  'Rules: (1) Use "spent" for purchases, "paid" for bills. ' +
  '(2) Use "dollars" as currency word (normalize even if receipt shows IDR). ' +
  '(3) Include merchant name if visible. ' +
  '(4) No preamble, no explanation, no formatting — ONLY the sentence.';

interface OcrBody {
  image: string; // data URL or raw base64
  mimeType?: string;
}

interface ParsedImage {
  base64: string;
  mimeType: string;
}

function parseImage(body: OcrBody): ParsedImage | null {
  let image = (body.image ?? '').trim();
  if (!image) return null;
  let mime = body.mimeType || 'image/jpeg';

  const dataUrlRe = /^data:([^;]+);base64,(.+)$/i;
  const m = image.match(dataUrlRe);
  if (m) {
    mime = m[1];
    image = m[2];
  }

  if (image.length < 100 || image.length > MAX_BASE64_LENGTH) return null;
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(mime)) mime = 'image/jpeg';

  return { base64: image, mimeType: mime };
}

async function callGroq(img: ParsedImage, apiKey: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: VISION_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
            },
          ],
        },
      ],
      temperature: 1,
      top_p: 1,
      max_completion_tokens: 200,
      stream: false,
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`groq_${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim() ?? '';
  if (!reply) throw new Error('groq_empty_reply');
  return reply;
}

function extractTotalAndMerchant(rawText: string): { total: number | null; merchant: string } {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const merchant = (lines[0] ?? '').slice(0, 60);

  let total: number | null = null;
  for (const line of lines) {
    if (/total/i.test(line)) {
      const m = line.match(/(\d+(?:[.,]\d+)?)/);
      if (m) {
        const num = parseFloat(m[1].replace(',', '.'));
        if (Number.isFinite(num) && num > 0) {
          total = num;
          break;
        }
      }
    }
  }

  if (total === null) {
    const all = rawText.match(/\d+(?:[.,]\d+)?/g) ?? [];
    const nums = all
      .map((s) => parseFloat(s.replace(',', '.')))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length) total = Math.max(...nums);
  }

  return { total, merchant };
}

async function callOcrSpace(img: ParsedImage, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append('base64Image', `data:${img.mimeType};base64,${img.base64}`);
  form.append('language', 'eng');
  form.append('isOverlayRequired', 'false');
  form.append('OCREngine', '2');
  form.append('scale', 'true');

  const res = await fetch(OCR_SPACE_URL, {
    method: 'POST',
    headers: { apikey: apiKey },
    body: form,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ocrspace_${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    IsErroredOnProcessing?: boolean;
    ErrorMessage?: string | string[];
    ParsedResults?: Array<{ ParsedText?: string }>;
  };

  if (data.IsErroredOnProcessing) {
    const msg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join('; ')
      : data.ErrorMessage;
    throw new Error(`ocrspace_errored: ${msg ?? 'unknown'}`);
  }

  const raw = data.ParsedResults?.map((r) => r.ParsedText ?? '').join('\n') ?? '';
  if (!raw.trim()) throw new Error('ocrspace_empty');

  const { total, merchant } = extractTotalAndMerchant(raw);
  if (!total) throw new Error('ocrspace_no_total');

  const merchantPart = merchant ? ` at ${merchant}` : '';
  return `spent ${total} dollars${merchantPart}`;
}

const receiptsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: OcrBody }>(
    '/receipts/ocr',
    {
      schema: {
        body: {
          type: 'object',
          required: ['image'],
          properties: {
            image: { type: 'string', minLength: 100, maxLength: MAX_BASE64_LENGTH },
            mimeType: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const groqKey = process.env.GROQ_API_KEY;
      const ocrSpaceKey = process.env.OCR_SPACE_KEY;

      if (!groqKey && !ocrSpaceKey) {
        return reply.code(503).send({
          error: 'ocr_unconfigured',
          message: 'Neither GROQ_API_KEY nor OCR_SPACE_KEY is set.',
        });
      }

      const img = parseImage(req.body);
      if (!img) {
        return reply.code(422).send({
          error: 'receipt_unreadable',
          message: 'Invalid or too-large image payload.',
        });
      }

      const attempts: Array<{ provider: string; fn: () => Promise<string> }> = [];
      if (groqKey) attempts.push({ provider: 'groq', fn: () => callGroq(img, groqKey) });
      if (ocrSpaceKey) attempts.push({ provider: 'ocrspace', fn: () => callOcrSpace(img, ocrSpaceKey) });

      const errors: string[] = [];
      for (const a of attempts) {
        try {
          const extractedText = await a.fn();
          return { ok: true, extractedText, provider: a.provider };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          fastify.log.warn({ provider: a.provider, err: msg }, 'ocr provider failed');
          errors.push(`${a.provider}: ${msg}`);
        }
      }

      return reply.code(502).send({
        error: 'ocr_upstream_error',
        reason: errors.join(' | ').slice(0, 500),
      });
    },
  );
};

export default receiptsRoutes;
