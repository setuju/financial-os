/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/receipts.ts
 * │  Purpose   : API route: receipts
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 */

import type { FastifyPluginAsync } from 'fastify';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
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

// --- GEMINI VISION ---
async function callGemini(img: ParsedImage, apiKey: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: VISION_PROMPT },
          { inline_data: { mime_type: img.mimeType, data: img.base64 } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 100 }
    }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`gemini_${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as any;
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!reply) throw new Error('gemini_empty_reply');
  return reply;
}

// --- OCR.SPACE (Fallback) ---
function extractTotalAndMerchant(rawText: string): { total: number | null; merchant: string } {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const merchant = (lines[0] ?? '').slice(0, 60);
  let total: number | null = null;

  for (const line of lines) {
    if (/total/i.test(line)) {
      const m = line.match(/(\d+(?:[.,]\d+)?)/);
      if (m) {
        const num = parseFloat(m[1].replace(',', '.'));
        if (Number.isFinite(num) && num > 0) { total = num; break; }
      }
    }
  }
  if (total === null) {
    const all = rawText.match(/\d+(?:[.,]\d+)?/g) ?? [];
    const nums = all.map((s) => parseFloat(s.replace(',', '.'))).filter((n) => Number.isFinite(n) && n > 0);
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
      const geminiKey = process.env.GEMINI_API_KEY;
      const ocrSpaceKey = process.env.OCR_SPACE_KEY;

      if (!geminiKey && !ocrSpaceKey) {
        return reply.code(503).send({ error: 'ocr_unconfigured', message: 'No OCR provider configured.' });
      }

      const img = parseImage(req.body);
      if (!img) return reply.code(422).send({ error: 'receipt_unreadable' });

      const attempts: Array<{ provider: string; fn: () => Promise<string> }> = [];
      
      // Prioritize Gemini (Stable, High Accuracy)
      if (geminiKey) attempts.push({ provider: 'gemini', fn: () => callGemini(img, geminiKey) });
      // Fallback to OCR.space
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
