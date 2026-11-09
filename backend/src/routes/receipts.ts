import type { FastifyPluginAsync } from 'fastify';
import { parseTransaction } from '../surplus/parser.js';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

const PROMPT = [
  'Read this receipt image. Output EXACTLY ONE English sentence describing the purchase.',
  'Format: "spent <amount> dollars on <items> at <merchant>" (use "paid" if it is a bill).',
  'Use the TOTAL amount. Example: "spent 9 dollars on coffee and croissant at Kopi Kenangan".',
  'Do NOT output anything else — no explanation, no markdown, no asterisks, no quotes, no preamble.',
  'Only the sentence.',
].join(' ');

const MAX_IMAGE_B64 = 4_000_000; // ~3MB binary
const REQUEST_TIMEOUT_MS = 45_000;

interface OcrBody {
  image: string;
}

interface GeminiResp {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
}

const receiptsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: OcrBody }>(
    '/receipts/ocr',
    {
      bodyLimit: MAX_IMAGE_B64 + 1_000,
      schema: {
        body: {
          type: 'object',
          required: ['image'],
          properties: {
            image: { type: 'string', minLength: 100, maxLength: MAX_IMAGE_B64 },
          },
        },
      },
    },
    async (req, reply) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return reply.code(503).send({
          ok: false,
          error: 'ocr_unconfigured',
          message: 'GEMINI_API_KEY is not set on the backend.',
        });
      }

      const raw = req.body.image;
      const m = raw.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
      if (!m) {
        return reply.code(400).send({ ok: false, error: 'invalid_image_format' });
      }
      const mime = m[1] === 'image/jpg' ? 'image/jpeg' : m[1];
      const b64 = m[2];

      const payload = {
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mime, data: b64 } },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 800, temperature: 0.1 },
      };

      let res: Response;
      try {
        res = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: {
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (err) {
        fastify.log.error({ err }, 'OCR fetch failed');
        return reply.code(502).send({ ok: false, error: 'ocr_upstream_error' });
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        fastify.log.error(
          { status: res.status, body: txt.slice(0, 500) },
          'Gemini OCR non-200',
        );
        return reply.code(502).send({ ok: false, error: 'ocr_upstream_error' });
      }

      let data: GeminiResp;
      try {
        data = (await res.json()) as GeminiResp;
      } catch {
        return reply.code(502).send({ ok: false, error: 'ocr_upstream_error' });
      }

      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const extractedText = parts
        .filter((p) => typeof p.text === 'string')
        .map((p) => p.text as string)
        .join('')
        .trim();

      if (!extractedText) {
        return reply.code(422).send({ ok: false, error: 'receipt_unreadable' });
      }

      // Try to parse using existing anti-budget parser
      const parsed = parseTransaction(extractedText);
      if (parsed.ok) {
        return {
          ok: true,
          extractedText,
          parsed: {
            amount: parsed.tx.amount,
            type: parsed.tx.type,
            category: parsed.tx.category,
          },
        };
      }

      // Parser refused (e.g. "spent 9.00 dollars on..." might parse cleanly,
      // but if not, still return raw text so user can edit manually)
      return {
        ok: true,
        extractedText,
        parsed: null,
        note: 'Text extracted; parser could not structure it. Edit and submit manually.',
      };
    },
  );
};

export default receiptsRoutes;
