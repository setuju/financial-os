import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { parseTransaction } from '../surplus/parser.js';
import { insertTransaction, listTransactions } from '../repositories/transactions.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface PostBody {
  text: string;
  userId?: string;
}

interface ListQuery {
  limit?: string;
  offset?: string;
}

const transactionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: PostBody }>(
    '/transactions',
    {
      schema: {
        body: {
          type: 'object',
          required: ['text'],
          additionalProperties: false,
          properties: {
            text: { type: 'string', minLength: 1, maxLength: 500 },
            userId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (req, reply) => {
      const { text, userId } = req.body;

      const parsed = parseTransaction(text);
      if (!parsed.ok) {
        return reply.code(400).send({
          error: parsed.reason,
          rawText: parsed.rawText,
        });
      }

      const transaction = await insertTransaction(fastify.pg, {
        userId: userId ?? null,
        parsed: parsed.tx,
      });

      return reply.code(201).send({ transaction });
    },
  );

  fastify.get<{ Querystring: ListQuery }>(
    '/transactions',
    async (req) => {
      const rawLimit = parseInt(req.query.limit ?? '50', 10);
      const rawOffset = parseInt(req.query.offset ?? '0', 10);
      const limit = Math.min(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50, 200);
      const offset = Math.max(Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0, 0);

      const transactions = await listTransactions(fastify.pg, { limit, offset });

      return {
        transactions,
        count: transactions.length,
        limit,
        offset,
      };
    },
  );
};

export default transactionsRoutes;
