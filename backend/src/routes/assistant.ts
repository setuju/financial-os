import type { FastifyPluginAsync } from 'fastify';
import { ASSISTANT_PROMPT, ASSISTANT_CANARY, ASSISTANT_PROMPT_VERSION } from '../agents/assistant.prompt.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3.8-flash';
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

interface ChatBody {
  message: string;
  history?: ChatMessage[];
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
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return reply.code(503).send({
          error: 'assistant_unconfigured',
          message:
            'OPENROUTER_API_KEY is not set in Render environment. This is expected until the assistant is configured.',
        });
      }

      const { message, history = [] } = req.body;

      // OpenRouter expects {role:'system'} — we prepend the prompt as system
      const openrouterMessages = [
        { role: 'system' as const, content: ASSISTANT_PROMPT },
        ...history.slice(-MAX_HISTORY).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const model = resolveModel();

      try {
        const res = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://financial-os-nu.vercel.app',
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

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          fastify.log.error(
            { status: res.status, body: text.slice(0, 500), model },
            'OpenRouter request failed',
          );
          // Surface a short reason to the client for debugging.
          // Never leak the key or full body.
          let reason = 'openrouter rejected request';
          try {
            const parsed = JSON.parse(text);
            if (parsed?.error?.message) reason = String(parsed.error.message).slice(0, 200);
          } catch {
            /* body was not JSON */
          }
          return reply.code(502).send({
            error: 'upstream_error',
            reason,
            model,
          });
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          model?: string;
        };
        const replyText = data.choices?.[0]?.message?.content ?? '';

        // Defense in depth: canary should never leak into output.
        if (replyText.includes(ASSISTANT_CANARY)) {
          fastify.log.error('CANARY LEAK DETECTED in assistant output');
          return reply.code(500).send({ error: 'internal_error' });
        }

        return {
          reply: replyText,
          model: data.model ?? model,
          version: ASSISTANT_PROMPT_VERSION,
        };
      } catch (err: unknown) {
        fastify.log.error({ err }, 'assistant request failed');
        return reply.code(502).send({ error: 'upstream_error' });
      }
    },
  );

  // Health/version endpoint (no auth, no model call)
  fastify.get('/assistant/info', async () => ({
    version: ASSISTANT_PROMPT_VERSION,
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    model: resolveModel(),
    // Do NOT return canary or prompt content here.
  }));
};

export default assistantRoutes;
