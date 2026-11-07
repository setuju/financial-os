import type { FastifyPluginAsync } from 'fastify';
import { ASSISTANT_PROMPT, ASSISTANT_CANARY, ASSISTANT_PROMPT_VERSION } from '../agents/assistant.prompt.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-flash-1.5';
const MAX_HISTORY = 6;
const MAX_OUTPUT_TOKENS = 400;
const REQUEST_TIMEOUT_MS = 30_000;

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

      const messages: ChatMessage[] = [
        { role: 'assistant', content: ASSISTANT_PROMPT }, // treated as system-equivalent via prefix
      ];
      // OpenRouter expects {role:'system'} — we prepend the prompt as system
      const openrouterMessages = [
        { role: 'system' as const, content: ASSISTANT_PROMPT },
        ...history.slice(-MAX_HISTORY).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: message },
      ];

      const model = process.env.ASSISTANT_MODEL ?? DEFAULT_MODEL;

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
            { status: res.status, body: text.slice(0, 500) },
            'OpenRouter request failed',
          );
          return reply.code(502).send({ error: 'upstream_error' });
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
    model: process.env.ASSISTANT_MODEL ?? DEFAULT_MODEL,
    // Do NOT return canary or prompt content here.
  }));
};

export default assistantRoutes;
