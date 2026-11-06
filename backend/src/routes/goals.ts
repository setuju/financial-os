import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { listGoals, createGoal } from '../repositories/goals.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface CreateGoalBody {
  name: string;
  targetAmount: number;
  monthlySaving: number;
  interestRate?: number;
  loanTermMonths?: number;
  startDate: string;
  durationMonths: number;
  progressPercent?: number;
}

const goalsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/goals', async () => {
    const goals = await listGoals(fastify.pg);
    return { goals };
  });

  fastify.post<{ Body: CreateGoalBody }>(
    '/goals',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'targetAmount', 'monthlySaving', 'startDate', 'durationMonths'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 200 },
            targetAmount: { type: 'number', minimum: 0.01 },
            monthlySaving: { type: 'number', minimum: 0 },
            interestRate: { type: 'number', minimum: 0, default: 0 },
            loanTermMonths: { type: 'integer', minimum: 0, default: 0 },
            startDate: { type: 'string', format: 'date' },
            durationMonths: { type: 'integer', minimum: 1 },
            progressPercent: { type: 'integer', minimum: 0, maximum: 100, default: 0 },
          },
        },
      },
    },
    async (req, reply) => {
      const b = req.body;
      const goal = await createGoal(fastify.pg, {
        name: b.name,
        targetAmount: b.targetAmount,
        monthlySaving: b.monthlySaving,
        interestRate: b.interestRate ?? 0,
        loanTermMonths: b.loanTermMonths ?? 0,
        startDate: b.startDate,
        durationMonths: b.durationMonths,
        progressPercent: b.progressPercent ?? 0,
      });
      return reply.code(201).send({ goal });
    },
  );
};

export default goalsRoutes;
