/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/assistant.ts
 * │  Purpose   : API route: assistant
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import type { FastifyPluginAsync } from 'fastify';
import { ASSISTANT_PROMPT, ASSISTANT_CANARY, ASSISTANT_PROMPT_VERSION } from '../agents/assistant.prompt.js';
import { buildAdvisorPrompt, ADVISOR_CANARY } from '../agents/advisors.prompt.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3.8-flash';

// Fallback provider (Google AI Studio native). Used when OpenRouter is
// unavailable (credit exhausted, rate limit, network). Same GEMINI_API_KEY
// as OCR. Model: gemini-3-flash-preview (proven working via /receipts/ocr).
const GEMINI_NATIVE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
const GEMINI_NATIVE_MODEL = 'gemini-3-flash-preview';
const MAX_HISTORY = 6;
const MAX_OUTPUT_TOKENS = 600;
const REQUEST_TIMEOUT_MS = 30_000;

// Resolve effective model id:
// - If env ASSISTANT_MODEL contains '/' (valid OpenRouter format), use it.
// - Otherwise fall back to DEFAULT_MODEL. This guards against env vars that
//   lost their provider prefix (e.g. 'gemini-flash-latest' without '~google/').
function resolveModel(): string {
  const envModel = (process.env.ASSISTANT_MODEL ?? '').trim();
  if (envModel.includes('/')) return envModel;
  if (envModel.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[assistant] ignoring ASSISTANT_MODEL='${envModel}' (missing provider/ prefix); using ${DEFAULT_MODEL}`,
    );
  }
  return DEFAULT_MODEL;
}


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}


interface AdvisorBody {
  persona: 'financial' | 'cashier' | 'insider';
}

interface ChatBody {
  message: string;
  history?: ChatMessage[];
}

interface AssistantCallResult {
  reply: string;
  provider: 'openrouter' | 'gemini';
  model: string;
}

async function callGeminiNative(
  apiKey: string,
  history: ChatMessage[],
  message: string,
): Promise<AssistantCallResult> {
  const contents = [
    ...history.slice(-MAX_HISTORY).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];
  const payload = {
    systemInstruction: { parts: [{ text: ASSISTANT_PROMPT }] },
    contents,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.3,
    },
  };
  const res = await fetch(GEMINI_NATIVE_URL, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`gemini_${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const reply =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('') ?? '';
  if (!reply.trim()) {
    throw new Error('gemini_empty_reply');
  }
  return { reply: reply.trim(), provider: 'gemini', model: GEMINI_NATIVE_MODEL };
}

const assistantRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ChatBody }>(
    '/assistant/chat',
    {
      schema: {
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 1000 },
            history: {
              type: 'array',
              maxItems: MAX_HISTORY,
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string', maxLength: 2000 },
                },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!openRouterKey && !geminiKey) {
        return reply.code(503).send({
          error: 'assistant_unconfigured',
          message: 'No AI provider configured (OPENROUTER_API_KEY or GEMINI_API_KEY required).',
        });
      }

      const { message, history = [] } = req.body;

      let result: AssistantCallResult | null = null;
      let lastError: string = 'no_provider_available';

      // Try OpenRouter first (if key present)
      if (openRouterKey) {
        const model = resolveModel();
        const openrouterMessages = [
          { role: 'system' as const, content: ASSISTANT_PROMPT },
          ...history.slice(-MAX_HISTORY).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user' as const, content: message },
        ];
        try {
          const res = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://financial.saturumah.net',
              'X-Title': 'Financial OS Assistant',
            },
            body: JSON.stringify({
              model,
              messages: openrouterMessages,
              max_tokens: MAX_OUTPUT_TOKENS,
              temperature: 0.3,
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          if (res.ok) {
            const data = (await res.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
              model?: string;
            };
            const replyText = data.choices?.[0]?.message?.content ?? '';
            if (replyText.trim()) {
              result = {
                reply: replyText.trim(),
                provider: 'openrouter',
                model: data.model ?? model,
              };
            } else {
              lastError = 'openrouter_empty_reply';
            }
          } else {
            const text = await res.text().catch(() => '');
            lastError = `openrouter_${res.status}`;
            fastify.log.warn(
              { status: res.status, body: text.slice(0, 300), model },
              'OpenRouter failed, will try Gemini fallback',
            );
          }
        } catch (err) {
          lastError = `openrouter_error: ${err instanceof Error ? err.message : 'unknown'}`;
          fastify.log.warn({ err }, 'OpenRouter threw, will try Gemini fallback');
        }
      }

      // Fallback: Gemini native (Google AI Studio)
      if (!result && geminiKey) {
        try {
          result = await callGeminiNative(geminiKey, history, message);
          fastify.log.info(
            { provider: 'gemini', model: GEMINI_NATIVE_MODEL },
            'Assistant served via Gemini fallback',
          );
        } catch (err) {
          lastError = `gemini_error: ${err instanceof Error ? err.message : 'unknown'}`;
          fastify.log.error({ err }, 'Gemini fallback failed');
        }
      }

      if (!result) {
        return reply.code(502).send({
          error: 'upstream_error',
          reason: lastError,
          providers_tried: [
            ...(openRouterKey ? ['openrouter'] : []),
            ...(geminiKey ? ['gemini'] : []),
          ],
        });
      }

      if (result.reply.includes(ASSISTANT_CANARY)) {
        fastify.log.error({ provider: result.provider }, 'CANARY LEAK DETECTED');
        return reply.code(500).send({ error: 'internal_error' });
      }

      return {
        reply: result.reply,
        model: result.model,
        provider: result.provider,
        version: ASSISTANT_PROMPT_VERSION,
      };
    },
  );

  // Health/version endpoint (no auth, no model call)
  fastify.get('/assistant/info', async () => ({
    version: ASSISTANT_PROMPT_VERSION,
    configured: Boolean(process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY),
    model: resolveModel(),
    providers: {
      openrouter: {
        available: Boolean(process.env.OPENROUTER_API_KEY),
        model: resolveModel(),
      },
      gemini: {
        available: Boolean(process.env.GEMINI_API_KEY),
        model: GEMINI_NATIVE_MODEL,
      },
    },
    // Do NOT return canary or prompt content here.
  }));

  fastify.post<{ Body: AdvisorBody }>(
    '/assistant/advisor',
    {
      schema: {
        body: {
          type: 'object',
          required: ['persona'],
          properties: {
            persona: { type: 'string', enum: ['financial', 'cashier', 'insider'] },
          },
        },
      },
    },
    async (req, reply) => {
      const sid = req.sessionId;
      const { persona } = req.body;

      // 1. Cek apakah transaksi >= 100
      const countRes = await fastify.pg.query(
        'SELECT COUNT(*)::int AS count FROM transactions WHERE session_id = $1',
        [sid]
      );
      const txCount = countRes.rows[0].count;
      
      if (txCount < 100) {
        return reply.code(403).send({ 
          error: 'insufficient_data', 
          message: 'You have too low data to compute. Reach 100 transactions to unlock Financial Advisors.' 
        });
      }

      // 2. Ambil data agregat untuk konteks AI
      const metricsRes = await fastify.pg.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions WHERE session_id = $1 AND is_projection = false
      `, [sid]);
      
      const income = Number(metricsRes.rows[0].total_income);
      const expense = Number(metricsRes.rows[0].total_expense);
      const balance = income - expense;
      
      const goalsRes = await fastify.pg.query(
        'SELECT name, target_amount, monthly_saving FROM goals WHERE session_id = $1 LIMIT 3',
        [sid]
      );
      const goals = goalsRes.rows.map(g => `${g.name} (Target: ${g.target_amount}, Monthly: ${g.monthly_saving})`).join(', ') || 'None';

      const catRes = await fastify.pg.query(`
        SELECT category, SUM(amount) as total FROM transactions 
        WHERE session_id = $1 AND type = 'expense' AND is_projection = false
        GROUP BY category ORDER BY total DESC LIMIT 3
      `, [sid]);
      const topCats = catRes.rows.map(c => `${c.category}: ${c.total}`).join(', ') || 'None';

      const dataContext = `
- Total Income: ${income.toFixed(2)}
- Total Expense: ${expense.toFixed(2)}
- Current Balance: ${balance.toFixed(2)}
- Top Expense Categories: ${topCats}
- Active Goals: ${goals}
- Total Transactions: ${txCount}
      `;

      const prompt = buildAdvisorPrompt(persona, dataContext);

      // 3. Panggil OpenRouter / Gemini (reuse logic from chat, simplified here for brevity)
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!openRouterKey && !geminiKey) {
        return reply.code(503).send({ error: 'advisor_unconfigured' });
      }

      let replyText = '';
      let provider = '';
      let model = '';

      if (openRouterKey) {
        try {
          const res = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://financial.saturumah.net',
              'X-Title': 'Financial OS Advisor',
            },
            body: JSON.stringify({
              model: resolveModel(),
              messages: [{ role: 'system', content: prompt }, { role: 'user', content: 'Give me your advice.' }],
              max_tokens: 300,
              temperature: 0.7,
            }),
            signal: AbortSignal.timeout(30000),
          });
          if (res.ok) {
            const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }>; model?: string };
            replyText = data.choices?.[0]?.message?.content ?? '';
            provider = 'openrouter';
            model = data.model ?? resolveModel();
          }
        } catch {}
      }

      // Fallback Gemini
      if (!replyText && geminiKey) {
        try {
          const res = await fetch(GEMINI_NATIVE_URL, {
            method: 'POST',
            headers: { 'x-goog-api-key': geminiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: prompt }] },
              contents: [{ role: 'user', parts: [{ text: 'Give me your advice.' }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(30000),
          });
          if (res.ok) {
            const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
            replyText = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
            provider = 'gemini';
            model = GEMINI_NATIVE_MODEL;
          }
        } catch {}
      }

      if (!replyText) {
        return reply.code(502).send({ error: 'advisor_upstream_error' });
      }

      // Canary check
      if (replyText.includes(ADVISOR_CANARY)) {
        fastify.log.error('ADVISOR CANARY LEAK DETECTED');
        return reply.code(500).send({ error: 'internal_error' });
      }

      return { reply: replyText.trim(), provider, model };
    }
  );

};

export default assistantRoutes;
