import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { paypalClient } from '../paypal/client.js';
import { createPayout } from '../repositories/payouts.js';
import { calculateSurplus } from '../repositories/surplus.js';

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
}

const impactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/impact/receivers', async () => {
    return { receivers: VETTED_RECEIVERS };
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
          },
        },
      },
    },
    async (req, reply) => {
      const { receiverId, amount, currency = 'USD', note = 'Financial OS Impact' } = req.body;

      const receiver = VETTED_RECEIVERS.find(r => r.id === receiverId);
      if (!receiver) {
        return reply.code(400).send({ error: 'invalid_receiver', message: 'Receiver not found or not vetted.' });
      }

      const metrics = await calculateSurplus(fastify.pg);
      const maxAmount = Math.max(0, metrics.currentSurplus * 0.1);

      if (amount > maxAmount + 0.001) {
        return reply.code(400).send({
          error: 'exceeds_ten_percent',
          message: `Amount exceeds 10% of surplus (max: ${maxAmount.toFixed(2)})`,
          max: maxAmount,
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
          }
        });

        const batchId = response.batchHeader?.payoutBatchId || null;

        const payout = await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail: receiver.email,
          status: 'success',
          paypalBatchId: batchId || undefined,
        });

        return reply.code(201).send({ payout, paypalResponse: response });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'PayPal payout failed');
        await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail: receiver.email,
          status: 'failed',
        });
        return reply.code(500).send({
          error: 'paypal_payout_failed',
          message: error.message || 'Unknown error',
          details: error.details || {},
        });
      }
    }
  );
};

export default impactRoutes;
