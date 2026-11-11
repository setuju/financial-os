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
import { insertTransaction } from '../repositories/transactions.js';
import { getSurplusPeriod, lastMonth, currentMonth, cascadeFrom, invalidateSurplusPeriods } from '../repositories/surplus-periods.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

const VETTED_RECEIVERS = [
  { id: "redcross", name: "American Red Cross", category: "Disaster relief", email: "redcross-sandbox@example.com", url: "https://www.redcross.org/donate/donation.html/" },
  { id: "directrelief", name: "Direct Relief", category: "Medical aid", email: "directrelief-sandbox@example.com", url: "https://www.directrelief.org/donate/" },
  { id: "unicef", name: "UNICEF", category: "Children & Education", email: "unicef-sandbox@example.com", url: "https://www.unicef.org/donate" },
  { id: "wck", name: "World Central Kitchen", category: "Hunger relief", email: "wck-sandbox@example.com", url: "https://wck.org/donate" },
  { id: "waterorg", name: "Water.org", category: "Water & Sanitation", email: "waterorg-sandbox@example.com", url: "https://water.org/donate/" },
  { id: "doctorswithoutborders", name: "Doctors Without Borders", category: "Healthcare", email: "msf-sandbox@example.com", url: "https://www.doctorswithoutborders.org/donate" },
  { id: "rainforest", name: "Rainforest Alliance", category: "Environment", email: "rainforest-sandbox@example.com", url: "https://www.rainforest-alliance.org/donate/" },
  { id: "savethechildren", name: "Save the Children", category: "Child welfare", email: "savechildren-sandbox@example.com", url: "https://www.savethechildren.org/us/ways-to-help/ways-to-give" },
];

interface PayoutBody {
  receiverId: string;
  amount: number;
  currency?: string;
  note?: string;
  sourcePeriod?: string;
  useCurrentMonth?: boolean;  // YYYY-MM-DD, defaults to last month
}

const impactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/impact/receivers', async () => {
    return { receivers: VETTED_RECEIVERS };
  });

  // Donation log (soft-deleted hidden by default)
  fastify.get<{ Querystring: { include_deleted?: string; limit?: string } }>(
    '/impact/payouts',
    async (req) => {
      const sid = req.sessionId;
      const includeDeleted = req.query.include_deleted === 'true';
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const payouts = await listPayouts(fastify.pg, sid, { includeDeleted, limit });
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
      const sid = req.sessionId;
      const ok = await softDeletePayout(fastify.pg, sid, req.params.id);
      if (!ok) return reply.code(404).send({ error: 'not_found' });
      return { ok: true, deletedId: req.params.id };
    },
  );

  // Horizon commitment for next month (warning on impact page)
  fastify.get('/impact/horizon-commitment', async (req) => {
    const sid = req.sessionId;
    const next = new Date();
    next.setUTCMonth(next.getUTCMonth() + 1);
    const nextMonth = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01`;

    const result = await fastify.pg.query(
      `SELECT name, monthly_saving
       FROM goals
       WHERE session_id = $2
               AND start_date < ($1::date + interval '1 month')
         AND (start_date + (duration_months || ' months')::interval) > $1::date
       ORDER BY monthly_saving DESC`,
      [nextMonth, sid],
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
            useCurrentMonth: { type: 'boolean' },
          },
        },
      },
    },
    async (req, reply) => {
      const sid = req.sessionId;
      const {
        receiverId, amount, currency = 'USD', note = 'Financial OS Impact',
        sourcePeriod,
        useCurrentMonth,
      } = req.body;

      let receiver = VETTED_RECEIVERS.find((r) => r.id === receiverId);
      if (!receiver && receiverId.includes('@')) {
        receiver = { id: receiverId, name: 'Custom Email', category: 'External', email: receiverId, url: '' };
      }
      if (!receiver) {
        return reply.code(400).send({ error: 'invalid_receiver' });
      }

      const source = sourcePeriod || (useCurrentMonth ? currentMonth() : lastMonth());

      // Validate: source month surplus must have enough remaining
      const period = await getSurplusPeriod(fastify.pg, sid, source);
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

      let response;
        try {
          response = await paypalClient.createBatchPayout({
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

        } catch (paypalErr: unknown) {
          fastify.log.error({ err: paypalErr }, 'PayPal payout failed');
          await createPayout(fastify.pg, sid, {
            amount,
            currency,
            receiverEmail: receiver.email,
            status: 'failed',
            sourcePeriod: source,
          });
          return reply.code(500).send({
            error: 'paypal_payout_failed',
            message: paypalErr instanceof Error ? paypalErr.message : 'Unknown error',
          });
        }

        const batchId = response.batchHeader?.payoutBatchId || null;

        const client = await fastify.pg.connect();
        let payout;
        try {
          await client.query('BEGIN');

          payout = await createPayout(client as any, sid, {
            amount,
            currency,
            receiverEmail: receiver.email,
            status: 'success',
            paypalBatchId: batchId || undefined,
            sourcePeriod: source,
          });

          await insertTransaction(client as any, sid, {
            userId: null,
            parsed: {
              amount: amount,
              type: 'expense',
              category: 'donation',
              occurredAt: new Date(),
              rawText: `Donation to ${receiver.name}`,
              source: 'payout',
            }
          });

          await client.query('COMMIT');
        } catch (dbErr: unknown) {
          await client.query('ROLLBACK');
          fastify.log.error({ err: dbErr }, 'DB insert failed after PayPal success');
          return reply.code(500).send({
            error: 'db_error_after_payout',
            message: 'Payout succeeded but database recording failed.',
          });
        } finally {
          client.release();
        }

        // Cascade recompute: source month + all forward months
        await cascadeFrom(fastify.pg, sid, source);
        // Invalidate cache agar surplus langsung terpotong
        await invalidateSurplusPeriods(fastify.pg, sid);

        return reply.code(201).send({
          payout,
          paypalResponse: response,
          surplus_updated: true,
          source_period: source,
        });
      
    },
  );

  // Surplus v2: verified (last month) + in-progress (current) + history (6 months)
  fastify.get('/impact/surplus', async (req) => {
    const sid = req.sessionId;
    const last = lastMonth();
    const cur = currentMonth();

    const [lastP, curP] = await Promise.all([
      getSurplusPeriod(fastify.pg, sid, last),
      getSurplusPeriod(fastify.pg, sid, cur),
    ]);

    // Detect first-month: last period has NO prior data at all.
    const lastHasData =
      Number(lastP.total_income) > 0 ||
      Number(lastP.total_expense) > 0 ||
      Number(lastP.opening_balance) > 0 ||
      Number(lastP.donations) > 0;
    const isFirstMonth = !lastHasData;

    // Walk back 6 months for history strip
    const history: Array<{ period: string; closing_surplus: number; status: string }> = [];
    const base = new Date(cur + 'T00:00:00Z');
    for (let i = 0; i < 6; i++) {
      const d = new Date(base);
      d.setUTCMonth(d.getUTCMonth() - i);
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
      try {
        const p = await getSurplusPeriod(fastify.pg, sid, ym);
        history.push({
          period: ym,
          closing_surplus: Number(p.closing_surplus),
          status: p.status,
        });
      } catch {
        // skip months without data
      }
    }

    // First month: distributable = current surplus (no prior period exists yet).
    // Month 2+: distributable = last month's closing surplus.
    const verifiedPeriod = isFirstMonth ? cur : last;
    const verifiedAmount = isFirstMonth
      ? Number(curP.closing_surplus)
      : Number(lastP.closing_surplus);

    return {
      verified: {
        period: verifiedPeriod,
        closing_surplus: verifiedAmount,
      },
      in_progress: {
        period: cur,
        closing_surplus: Number(curP.closing_surplus),
        status: curP.status,
      },
      is_first_month: isFirstMonth,
      history,
    };
  });
};

export default impactRoutes;
