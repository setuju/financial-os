import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { getSummary, type GroupBy, type TypeFilter } from '../repositories/reports.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface SummaryQuery {
  from: string;
  to: string;
  groupBy?: GroupBy;
  type?: TypeFilter;
  includeProjections?: string;
}

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: SummaryQuery }>(
    '/reports/summary',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string', format: 'date' },
            to: { type: 'string', format: 'date' },
            groupBy: { type: 'string', enum: ['day', 'week', 'month', 'year'], default: 'day' },
            type: { type: 'string', enum: ['income', 'expense', 'all'], default: 'all' },
            includeProjections: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { from, to } = req.query;
      const groupBy: GroupBy = req.query.groupBy ?? 'day';
      const type: TypeFilter = req.query.type ?? 'all';
      const includeProjections = req.query.includeProjections === 'true';

      const fromD = new Date(`${from}T00:00:00.000Z`);
      const toD = new Date(`${to}T23:59:59.999Z`);
      if (isNaN(fromD.getTime()) || isNaN(toD.getTime())) {
        return reply.code(400).send({ error: 'invalid_date_range' });
      }
      if (fromD > toD) {
        return reply.code(400).send({ error: 'from_after_to' });
      }

      const result = await getSummary(fastify.pg, {
        from: fromD,
        to: toD,
        groupBy,
        type,
        includeProjections,
      });
      return result;
    },
  );
};

export default reportsRoutes;
