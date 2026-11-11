/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/reports.ts
 * │  Purpose   : API route: reports
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

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

type GroupBy = 'day' | 'week' | 'month' | 'year';
type TxnType = 'income' | 'expense' | 'all';


interface CategoryQuery {
  from: string;
  to: string;
  type: 'income' | 'expense';
}

interface SummaryQuery {
  from: string;
  to: string;
  groupBy?: GroupBy;
  type?: TxnType;
  includeProjections?: string;
}

interface Bucket {
  period: string;
  income: number;
  expense: number;
  net: number;
  opening: number;
  closing: number;
  status: 'actual' | 'projected' | 'mixed';
  actualCount: number;
  projectionCount: number;
}

const VALID_GROUPS: GroupBy[] = ['day', 'week', 'month', 'year'];

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: SummaryQuery }>(
    '/reports/summary',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to'],
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            groupBy: { type: 'string', enum: VALID_GROUPS, default: 'month' },
            type: { type: 'string', enum: ['income', 'expense', 'all'], default: 'all' },
            includeProjections: { type: 'string' },
          },
        },
      },
    },
    async (req) => {
      const sid = req.sessionId;
      const { from, to } = req.query;
      const groupBy = (req.query.groupBy ?? 'month') as GroupBy;
      const typeFilter = req.query.type;
      const includeProjections = req.query.includeProjections === 'true';

      // Convert to inclusive full-day timestamps.
      // Client sends date strings ('YYYY-MM-DD'); backend treats as
      // [from 00:00:00Z, to 23:59:59.999Z] so transactions added ANY time
      // on `to` day are included (< next midnight, or <= 23:59:59.999).
      const fromTs = `${from}T00:00:00.000Z`;
      const toTs = `${to}T23:59:59.999Z`;

      const projClause = includeProjections ? '' : 'AND is_projection = false';
      const typeClause = typeFilter && typeFilter !== 'all'
        ? `AND type = '${typeFilter === 'income' ? 'income' : 'expense'}'`
        : '';

      // 1) Opening = net sum of all tx BEFORE `from`
      const beforeRes = await fastify.pg.query(
        `SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) AS opening
         FROM transactions
         WHERE occurred_at < $1 AND session_id = $2 ${projClause} ${typeClause}`,
        [fromTs, sid],
      );
      let opening = Number(beforeRes.rows[0].opening);

      // 2) Buckets with per-bucket actual/projection counts
      const bucketRes = await fastify.pg.query(
        `SELECT
           DATE_TRUNC($4, occurred_at) AS period,
           COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense,
           COUNT(*) FILTER (WHERE is_projection = false)::int AS actual_count,
           COUNT(*) FILTER (WHERE is_projection = true)::int  AS projection_count
         FROM transactions
         WHERE occurred_at >= $1 AND occurred_at < $2 AND session_id = $3 ${projClause} ${typeClause}
         GROUP BY 1
         ORDER BY 1 ASC`,
        [fromTs, toTs, sid, groupBy],
      );

      const buckets: Bucket[] = bucketRes.rows.map((r) => {
        const income = Number(r.income);
        const expense = Number(r.expense);
        const net = income - expense;
        const bucketOpening = opening;
        const closing = bucketOpening + net;
        opening = closing;
        const ac = Number(r.actual_count);
        const pc = Number(r.projection_count);
        let status: 'actual' | 'projected' | 'mixed' = 'actual';
        if (ac > 0 && pc > 0) status = 'mixed';
        else if (pc > 0 && ac === 0) status = 'projected';
        return {
          period: r.period instanceof Date ? r.period.toISOString() : String(r.period),
          income,
          expense,
          net,
          opening: bucketOpening,
          closing,
          status,
          actualCount: ac,
          projectionCount: pc,
        };
      });

      // 3) Totals — use same opening as the very first bucket, not the accumulated one
      const totalIncome = buckets.reduce((s, b) => s + b.income, 0);
      const totalExpense = buckets.reduce((s, b) => s + b.expense, 0);
      const totalNet = totalIncome - totalExpense;
      const openingOfFirst = buckets.length > 0 ? buckets[0].opening : opening;
      const closingOfLast = buckets.length > 0 ? buckets[buckets.length - 1].closing : opening;

      return {
        buckets,
        totals: {
          income: totalIncome,
          expense: totalExpense,
          net: totalNet,
          opening: openingOfFirst,
          closing: closingOfLast,
        },
      };
    },
  );

  fastify.get<{ Querystring: CategoryQuery }>(
    '/reports/categories',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['from', 'to', 'type'],
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            type: { type: 'string', enum: ['income', 'expense'] },
          },
        },
      },
    },
    async (req) => {
      const sid = req.sessionId;
      const { from, to, type } = req.query;
      const fromTs = `${from}T00:00:00.000Z`;
      const toTs = `${to}T23:59:59.999Z`;

      const res = await fastify.pg.query(
        `SELECT category, COALESCE(SUM(amount), 0) AS total
         FROM transactions
         WHERE session_id = $1 
           AND type = $2 
           AND occurred_at >= $3 
           AND occurred_at <= $4 
           AND is_projection = false
         GROUP BY category
         ORDER BY total DESC`,
        [sid, type, fromTs, toTs],
      );

      return { 
        categories: res.rows.map((r) => ({ 
          name: r.category, 
          value: Number(r.total) 
        })) 
      };
    },
  );

};

export default reportsRoutes;
