/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/surplus.ts
 * │  Purpose   : API route: surplus
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
import {
  calculateSurplus,
  createPrediction,
  getLatestPrediction,
  listPredictions,
  updatePrediction,
  deletePrediction,
  markPredictionAchieved
} from '../repositories/surplus.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface PredictBody {
  predictedAmount: number;
  period: string;
  reason: string;
}

const VALID_PERIODS = ['next_week', 'next_month', 'this_year', 'next_year'];

const surplusRoutes: FastifyPluginAsync = async (fastify) => {
  // B2: hardcoded admin — B3 replaces with session extraction
  const sid = '00000000-0000-0000-0000-000000000001';

  fastify.get('/surplus/current', async () => {
    const metrics = await calculateSurplus(fastify.pg, sid);
    const prediction = await getLatestPrediction(fastify.pg, sid);
    return { metrics, prediction };
  });

  fastify.get('/surplus/predictions', async () => {
    const predictions = await listPredictions(fastify.pg, sid);
    return { predictions };
  });

  fastify.post<{ Body: PredictBody }>(
    '/surplus/predict',
    {
      schema: {
        body: {
          type: 'object',
          required: ['predictedAmount', 'period'],
          properties: {
            predictedAmount: { type: 'number', minimum: 0 },
            period: { type: 'string', enum: VALID_PERIODS },
            reason: { type: 'string', default: '' },
          },
        },
      },
    },
    async (req, reply) => {
      const { predictedAmount, period, reason = '' } = req.body;
      const prediction = await createPrediction(fastify.pg, sid, { predictedAmount, period, reason });
      return reply.code(201).send({ prediction });
    }
  );

  fastify.put<{ Params: { id: string }, Body: PredictBody }>(
    '/surplus/predict/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } } },
        body: {
          type: 'object',
          required: ['predictedAmount', 'period'],
          properties: {
            predictedAmount: { type: 'number', minimum: 0 },
            period: { type: 'string', enum: VALID_PERIODS },
            reason: { type: 'string', default: '' },
          },
        },
      },
    },
    async (req, reply) => {
      const { predictedAmount, period, reason = '' } = req.body;
      const prediction = await updatePrediction(fastify.pg, sid, req.params.id, { predictedAmount, period, reason });
      if (!prediction) return reply.code(404).send({ error: 'not_found' });
      return { prediction };
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/surplus/predict/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } } },
      },
    },
    async (req, reply) => {
      const success = await deletePrediction(fastify.pg, sid, req.params.id);
      if (!success) return reply.code(404).send({ error: 'not_found' });
      return reply.code(204).send();
    }
  );

  fastify.post<{ Params: { id: string } }>(
    '/surplus/predictions/:id/achieve',
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
      const prediction = await markPredictionAchieved(fastify.pg, sid, req.params.id);
      if (!prediction) {
        return reply.code(404).send({ error: 'not_found_or_already_achieved' });
      }
      return { prediction };
    },
  );

};

export default surplusRoutes;
