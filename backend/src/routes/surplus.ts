import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import {
  calculateSurplus,
  createPrediction,
  getLatestPrediction,
  listPredictions,
  updatePrediction,
  deletePrediction
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
  fastify.get('/surplus/current', async () => {
    const metrics = await calculateSurplus(fastify.pg);
    const prediction = await getLatestPrediction(fastify.pg);
    return { metrics, prediction };
  });

  fastify.get('/surplus/predictions', async () => {
    const predictions = await listPredictions(fastify.pg);
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
      const prediction = await createPrediction(fastify.pg, { predictedAmount, period, reason });
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
      const prediction = await updatePrediction(fastify.pg, req.params.id, { predictedAmount, period, reason });
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
      const success = await deletePrediction(fastify.pg, req.params.id);
      if (!success) return reply.code(404).send({ error: 'not_found' });
      return reply.code(204).send();
    }
  );
};

export default surplusRoutes;
