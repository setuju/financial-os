import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { calculateSurplus, createPrediction, getLatestPrediction } from '../repositories/surplus.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface PredictBody {
  predictedAmount: number;
}

const surplusRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /surplus/current
  fastify.get('/surplus/current', async () => {
    const metrics = await calculateSurplus(fastify.pg);
    const prediction = await getLatestPrediction(fastify.pg);
    
    return {
      metrics,
      prediction,
    };
  });

  // POST /surplus/predict
  fastify.post<{ Body: PredictBody }>(
    '/surplus/predict',
    {
      schema: {
        body: {
          type: 'object',
          required: ['predictedAmount'],
          properties: {
            predictedAmount: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (req, reply) => {
      const { predictedAmount } = req.body;
      const prediction = await createPrediction(fastify.pg, predictedAmount);
      return reply.code(201).send({ prediction });
    }
  );
};

export default surplusRoutes;
