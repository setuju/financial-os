/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/routes/impact.ts
 * │  Purpose   : API route: impact
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
import { paypalClient } from '../paypal/client.js';
import { createPayout, listPayouts, softDeletePayout } from '../repositories/payouts.js';
import { getSurplusPeriod, lastMonth, currentMonth, cascadeFrom } from '../repositories/surplus-periods.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

const VETTED_RECEIVERS = [
  { id: 'aidpulse', name: 'AidPulse', category: 'Disaster relief', email: 'aidpulse-sandbox@example.com' },
  { id: 'caregrid', name: 'CareGrid', category: 'Community health', email: 'caregrid-sandbox@example.com' },
  { id: 'opentreasury', name: 'OpenTreasury', category: 'Financial inclusion', email: 'opentreasury-sandbox@example.com' },
];

interface PayoutBody {
  receiverId: string;
  amount: number;
  currency?: string;
  note?: string;
  sourcePeriod?: string;  // YYYY-MM-DD, defaults to last month
}

const impactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/impact/receivers', async () => {
    return { receivers: VETTED_RECEIVERS };
  });

  // Donation log (soft-deleted hidden by default)
  fastify.get<{ Querystring: { include_deleted?: string; limit?: string } }>(
    '/impact/payouts',
    async (req) => {
      const includeDeleted = req.query.include_deleted === 'true';
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const payouts = await listPayouts(fastify.pg, { includeDeleted, limit });
      return { payouts };
    },
  );

  // Soft delete a donation log entry (money is gone; surplus stays reduced)
  fastify.delete<{ Params: { id: string } }>(
    '/impact/payouts/:id',
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
      const ok = await softDeletePayout(fastify.pg, req.params.id);
      if (!ok) return reply.code(404).send({ error: 'not_found' });
      return { ok: true, deletedId: req.params.id };
    },
  );

  // Horizon commitment for next month (warning on impact page)
  fastify.get('/impact/horizon-commitment', async () => {
    const next = new Date();
    next.setUTCMonth(next.getUTCMonth() + 1);
    const nextMonth = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01`;

    const result = await fastify.pg.query(
      `SELECT name, monthly_saving
       FROM goals
       WHERE start_date < ($1::date + interval '1 month')
         AND (start_date + (duration_months || ' months')::interval) > $1::date
       ORDER BY monthly_saving DESC`,
      [nextMonth],
    );

    const breakdown = result.rows.map((r) => ({
      name: String(r.name),
      monthly: Number(r.monthly_saving),
    }));
    const total = breakdown.reduce((s, r) => s + r.monthly, 0);

    return { nextMonth, total, breakdown };
  });

  fastify.post<{ Body: PayoutBody }>(
    '/impact/payout',
    {
      schema: {
        body: {
          type: 'object',
          required: ['receiverId', 'amount'],
          properties: {
            receiverId: { type: 'string' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            note: { type: 'string' },
            sourcePeriod: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const {
        receiverId, amount, currency = 'USD', note = 'Financial OS Impact',
        sourcePeriod,
      } = req.body;

      const receiver = VETTED_RECEIVERS.find((r) => r.id === receiverId);
      if (!receiver) {
        return reply.code(400).send({ error: 'invalid_receiver' });
      }

      const source = sourcePeriod || lastMonth();

      // Validate: source month surplus must have enough remaining
      const period = await getSurplusPeriod(fastify.pg, source);
      const available = Number(period.closing_surplus);
      if (amount > available + 0.001) {
        return reply.code(400).send({
          error: 'insufficient_surplus',
          message: `Amount exceeds ${source} closing surplus (${
            available.toFixed(2)
          })`,
          available,
          sourcePeriod: source,
        });
      }

      try {
        const response = await paypalClient.createBatchPayout({
          body: {
            senderBatchHeader: {
              senderBatchId: `batch_${Date.now()}`,
              emailSubject: 'Financial OS Impact Payout',
            },
            items: [
              {
                recipientType: 'EMAIL',
                amount: { value: amount.toFixed(2), currency },
                receiver: receiver.email,
                note,
                senderItemId: `item_${Date.now()}`,
              },
            ],
          },
        });

        const batchId = response.batchHeader?.payoutBatchId || null;

        const payout = await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail: receiver.email,
          status: 'success',
          paypalBatchId: batchId || undefined,
          sourcePeriod: source,
        });

        // Cascade recompute: source month + all forward months
        await cascadeFrom(fastify.pg, source);

        return reply.code(201).send({
          payout,
          paypalResponse: response,
          surplus_updated: true,
          source_period: source,
        });
      } catch (error: unknown) {
        fastify.log.error({ err: error }, 'PayPal payout failed');
        await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail: receiver.email,
          status: 'failed',
          sourcePeriod: source,
        });
        return reply.code(500).send({
          error: 'paypal_payout_failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  );

  // Surplus v2: verified (last month) + in-progress (current) + history (6 months)
  fastify.get('/impact/surplus', async () => {
    const last = lastMonth();
    const cur = currentMonth();

    const [lastP, curP] = await Promise.all([
      getSurplusPeriod(fastify.pg, last),
      getSurplusPeriod(fastify.pg, cur),
    ]);

    // Walk back 6 months for history strip
    const history: Array<{ period: string; closing_surplus: number; status: string }> = [];
    const base = new Date(cur + 'T00:00:00Z');
    for (let i = 0; i < 6; i++) {
      const d = new Date(base);
      d.setUTCMonth(d.getUTCMonth() - i);
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
      try {
        const p = await getSurplusPeriod(fastify.pg, ym);
        history.push({
          period: ym,
          closing_surplus: Number(p.closing_surplus),
          status: p.status,
        });
      } catch {
        // skip months without data
      }
    }

    return {
      verified: {
        period: last,
        closing_surplus: Number(lastP.closing_surplus),
      },
      in_progress: {
        period: cur,
        closing_surplus: Number(curP.closing_surplus),
        status: curP.status,
      },
      history,
    };
  });
};

export default impactRoutes;
