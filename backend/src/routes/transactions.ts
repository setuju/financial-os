/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/transactions.ts
 * │  Purpose   : API route: transactions
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
import type pg from 'pg';
import { parseTransaction, parseMultipleTransactions } from '../surplus/parser.js';
import { classifyCategoryWithAI } from '../services/astropods.js';
import type { ParsedTransaction } from '../surplus/parser.js';
import { updateTransaction } from '../repositories/transactions.js';
import { invalidateSurplusPeriods } from '../repositories/surplus-periods.js';
import { insertTransaction, listTransactions } from '../repositories/transactions.js';

import type { Client as ElasticClient } from '@elastic/elasticsearch';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
    elastic: ElasticClient;
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
      const sid = req.sessionId;
      const { text, userId } = req.body;

      const parseResults = parseMultipleTransactions(text);
      const successfulTxs = parseResults
        .filter((r): r is { ok: true; tx: ParsedTransaction } => r.ok)
        .map((r) => r.tx);

      
        // AI Fallback for 'other' categories
        for (const tx of successfulTxs) {
          if (tx.category === 'other') {
            tx.category = await classifyCategoryWithAI(tx.rawText, tx.type) as any;
          }
        }

        if (successfulTxs.length === 0) {
        const firstError = parseResults[0];
        return reply.code(400).send({
          error: firstError.ok ? 'invalid_input' : firstError.reason,
          rawText: text,
        });
      }

      const inserted: any[] = [];
      const client = await fastify.pg.connect();
      
      try {
        await client.query('BEGIN');
        for (const tx of successfulTxs) {
          const transaction = await insertTransaction(client as any, sid, {
            userId: userId ?? null,
            parsed: tx,
          });
          inserted.push(transaction);
        }
        await client.query('COMMIT');
      } catch (dbErr) {
        await client.query('ROLLBACK');
        throw dbErr;
      } finally {
        client.release();
      }
      await invalidateSurplusPeriods(fastify.pg, sid);

      return reply.code(201).send({ transaction: inserted[0], transactions: inserted });
    },
  );


  fastify.get<{ Querystring: { q: string } }>(
    '/transactions/search',
    async (req, reply) => {
      const { q } = req.query;
      if (!q) {
        return reply.code(400).send({ error: 'Missing search query' });
      }
      
      try {
        const result = await fastify.elastic.search({
          index: 'transactions',
          query: {
            multi_match: {
              query: q,
              fields: ['raw_text', 'category'],
            },
          },
        });
        return {
          hits: result.hits.hits.map((h) => h._source),
          total: (result.hits.total as any).value,
        };
      } catch (error) {
        fastify.log.error({ err: error }, 'Elastic search failed');
        return reply.code(500).send({ error: 'search_failed' });
      }
    }
  );

  
  fastify.post<{ Body: { text: string } }>(
    '/transactions/preview',
    {
      schema: {
        body: {
          type: 'object',
          required: ['text'],
          additionalProperties: false,
          properties: {
            text: { type: 'string', minLength: 1, maxLength: 500 },
          },
        },
      },
    },
    async (req, reply) => {
      const { text } = req.body;
      const parseResults = parseMultipleTransactions(text);
      const successfulTxs = parseResults
        .filter((r): r is { ok: true; tx: ParsedTransaction } => r.ok)
        .map((r) => r.tx);

      if (successfulTxs.length === 0) {
        const firstError = parseResults[0];
        return reply.code(400).send({
          error: firstError.ok ? 'invalid_input' : firstError.reason,
          rawText: text,
        });
      }

      return reply.send({ transactions: successfulTxs });
    }
  );

  
  fastify.post<{ Body: { transactions: any[] } }>(
    '/transactions/batch',
    {
      schema: {
        body: {
          type: 'object',
          required: ['transactions'],
          properties: {
            transactions: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['amount', 'type', 'category', 'rawText'],
                properties: {
                  amount: { type: 'number' },
                  type: { type: 'string', enum: ['income', 'expense'] },
                  category: { type: 'string' },
                  rawText: { type: 'string' },
                }
              }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const sid = req.sessionId;
      const { transactions } = req.body;

      const inserted: any[] = [];
      const client = await fastify.pg.connect();
      try {
        await client.query('BEGIN');
        for (const tx of transactions) {
          const transaction = await insertTransaction(client as any, sid, {
            userId: null,
            parsed: { amount: tx.amount, type: tx.type, category: tx.category, occurredAt: new Date(), rawText: tx.rawText, source: 'manual_edit' }
          });
          inserted.push(transaction);
        }
        await client.query('COMMIT');
      } catch (err: any) { 
        await client.query('ROLLBACK'); 
        fastify.log.error({ err }, 'Batch insert failed');
        return reply.code(500).send({ error: 'db_error', message: err.message });
      } finally { 
        client.release(); 
      }
      await invalidateSurplusPeriods(fastify.pg, sid);
      return reply.code(201).send({ transactions: inserted });
    }
  );

  fastify.get<{ Querystring: ListQuery }>(
    '/transactions',
    async (req) => {
      const sid = req.sessionId;
      const rawLimit = parseInt(req.query.limit ?? '50', 10);
      const rawOffset = parseInt(req.query.offset ?? '0', 10);
      const limit = Math.min(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50, 200);
      const offset = Math.max(Number.isFinite(rawOffset) && rawOffset > 0 ? rawOffset : 0, 0);

      const transactions = await listTransactions(fastify.pg, sid, { limit, offset });

      return {
        transactions,
        count: transactions.length,
        limit,
        offset,
      };
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/transactions/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (req, reply) => {
      const sid = req.sessionId;
      const { id } = req.params;
      try {
        const result = await fastify.pg.query(
          'DELETE FROM transactions WHERE id = $1 AND session_id = $2 RETURNING id',
              [id, sid],
        );
        if ((result.rowCount ?? 0) === 0) {
          return reply.code(404).send({ error: 'not_found' });
        }
        await invalidateSurplusPeriods(fastify.pg, sid);
              return { ok: true, deletedId: id };
      } catch (err) {
        req.log.error({ err }, 'delete transaction failed');
        return reply.code(500).send({ error: 'internal_error' });
      }
    },
  );


  fastify.put<{ Params: { id: string }, Body: { raw_text: string } }>(
    '/transactions/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', minLength: 1 } },
        },
        body: {
          type: 'object',
          required: ['raw_text'],
          properties: {
            raw_text: { type: 'string', minLength: 1, maxLength: 500 },
          },
        },
      },
    },
    async (req, reply) => {
      const sid = req.sessionId;
      const { id } = req.params;
      const { raw_text } = req.body;
      const parsed = parseTransaction(raw_text);
      if (!parsed.ok) {
        return reply.code(400).send({ error: parsed.reason, rawText: raw_text });
      }
      const updated = await updateTransaction(fastify.pg, sid, id, {
        rawText: raw_text,
        amount: parsed.tx.amount,
        type: parsed.tx.type,
        category: parsed.tx.category,
      });

        // Invalidate surplus cache so next /impact/surplus recomputes
        await invalidateSurplusPeriods(fastify.pg, sid);
      if (!updated) {
        return reply.code(404).send({ error: 'not_found' });
      }
      return { ok: true, transaction: updated };
    },
  );

};

export default transactionsRoutes;
