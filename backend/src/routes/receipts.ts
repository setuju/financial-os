/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/receipts.ts
 * │  Purpose   : API route: receipts
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 */

import type { FastifyPluginAsync } from 'fastify';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OCR_SPACE_URL = 'https://api.ocr.space/parse/image';
const MAX_BASE64_LENGTH = 3_000_000; // ~3MB base64
const UPSTREAM_TIMEOUT_MS = 30_000;

const VISION_PROMPT =
  'Extract from this receipt: what was bought and the total amount paid. ' +
  'Output ONE short natural-language sentence like: "spent 9 dollars on coffee at Kopi Kenangan". ' +
  'Rules: (1) Use "spent" for purchases, "paid" for bills. ' +
  '(2) Use "dollars" as currency word (normalize even if receipt shows IDR). ' +
  '(3) Include merchant name if visible. ' +
  '(4) No preamble, no explanation, no formatting — ONLY the sentence.';

interface OcrBody { image: string; mimeType?: string; }
interface ParsedImage { base64: string; mimeType: string; }

function parseImage(body: OcrBody): ParsedImage | null {
  let image = (body.image ?? '').trim();
  if (!image) return null;
  let mime = body.mimeType || 'image/jpeg';
  const dataUrlRe = /^data:([^;]+);base64,(.+)$/i;
  const m = image.match(dataUrlRe);
  if (m) { mime = m[1]; image = m[2]; }
  if (image.length < 100 || image.length > MAX_BASE64_LENGTH) return null;
  if (!/^image\/(png|jpeg|jpg|webp)$/i.test(mime)) mime = 'image/jpeg';
  return { base64: image, mimeType: mime };
}

// --- OPENROUTER VISION (Primary) ---
async function callOpenRouterVision(img: ParsedImage, apiKey: string): Promise<string> {
  // Force a known-good vision model on OpenRouter.
  // ASSISTANT_MODEL is for the text assistant, not guaranteed to support vision.
  const model = 'google/gemini-flash-1.5';
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://financial.saturumah.net',
      'X-Title': 'Financial OS'
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: VISION_PROMPT },
          { type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.base64}` } }
        ]
      }],
      temperature: 0.1,
      max_tokens: 100,
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`openrouter_${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as any;
  const reply = data.choices?.[0]?.message?.content?.trim() ?? '';
  // If OpenRouter just echoed "spent" or failed to see numbers, force fallback
  if (!reply || reply.split(' ').length < 2 || !/\d/.test(reply)) {
    throw new Error(`openrouter_invalid_reply: ${reply.slice(0, 50)}`);
  }
  return reply;
}

// --- OCR.SPACE (Fallback with Smarter Regex) ---
function extractTotalAndMerchant(rawText: string): { total: number | null; merchant: string } {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const merchant = (lines[0] ?? '').slice(0, 60);
  let total: number | null = null;

  // 1. Cari "TOTAL" dan ambil angka di baris itu ATAU 3 baris di bawahnya
  const totalIdx = lines.findIndex(l => /total/i.test(l));
  if (totalIdx !== -1) {
    const chunk = lines.slice(totalIdx, totalIdx + 4).join(' ');
    const nums = chunk.match(/\$?\s*(\d+(?:[.,]\d{2})?)/g);
    if (nums) {
      const parsed = nums
        .map(n => parseFloat(n.replace(/[^\d.,]/g, '').replace(',', '.')))
        .filter(n => !isNaN(n) && n > 0);
      if (parsed.length) total = Math.max(...parsed); // Largest number in the chunk
    }
  }

  // 2. Jika gagal, cari angka dengan simbol '$' dan ambil yang terbesar
  if (total === null) {
    const currencyMatches = rawText.match(/\$\s*(\d+(?:[.,]\d{2})?)/g);
    if (currencyMatches) {
      const nums = currencyMatches.map(s => parseFloat(s.replace(/[^\d.,]/g, '').replace(',', '.'))).filter(n => !isNaN(n));
      if (nums.length) total = Math.max(...nums);
    }
  }

  // 3. Fallback terakhir: angka apapun, abaikan tahun (1900-2100)
  if (total === null) {
    const all = rawText.match(/(?:\$)?\s*(\d+(?:[.,]\d{1,2})?)/g) ?? [];
    const nums = all
      .map((s) => parseFloat(s.replace(/[^\d.,]/g, '').replace(',', '.')))
      .filter((n) => !isNaN(n) && n > 0)
      .filter((n) => !(n >= 1900 && n <= 2100)); // ignore years
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

  if (!res.ok) throw new Error(`ocrspace_${res.status}`);
  const data = (await res.json()) as any;
  if (data.IsErroredOnProcessing) throw new Error(`ocrspace_errored: ${data.ErrorMessage}`);

  const raw = data.ParsedResults?.map((r: any) => r.ParsedText ?? '').join('\n') ?? '';
  if (!raw.trim()) throw new Error('ocrspace_empty');

  const { total, merchant } = extractTotalAndMerchant(raw);
  if (!total) throw new Error('ocrspace_no_total');

  return `spent ${total} dollars${merchant ? ` at ${merchant}` : ''}`;
}

const receiptsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: OcrBody }>(
    '/receipts/ocr',
    {
      schema: {
        body: {
          type: 'object', required: ['image'],
          properties: {
            image: { type: 'string', minLength: 100, maxLength: MAX_BASE64_LENGTH },
            mimeType: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const ocrSpaceKey = process.env.OCR_SPACE_KEY;

      if (!openRouterKey && !ocrSpaceKey) {
        return reply.code(503).send({ error: 'ocr_unconfigured', message: 'No OCR provider configured.' });
      }

      const img = parseImage(req.body);
      if (!img) return reply.code(422).send({ error: 'receipt_unreadable' });

      const attempts: Array<{ provider: string; fn: () => Promise<string> }> = [];
      
      if (openRouterKey) attempts.push({ provider: 'openrouter_vision', fn: () => callOpenRouterVision(img, openRouterKey) });
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

      return reply.code(502).send({ error: 'ocr_upstream_error', reason: errors.join(' | ').slice(0, 500) });
    },
  );
};

export default receiptsRoutes;
