import type { FastifyPluginAsync } from 'fastify';
import type pg from 'pg';
import { paypalClient } from '../paypal/client.js';
import { createPayout } from '../repositories/payouts.js';

declare module 'fastify' {
  interface FastifyInstance {
    pg: pg.Pool;
  }
}

interface PayoutBody {
  receiverEmail: string;
  amount: number;
  currency?: string;
  note?: string;
}

const impactRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: PayoutBody }>(
    '/impact/payout',
    {
      schema: {
        body: {
          type: 'object',
          required: ['receiverEmail', 'amount'],
          properties: {
            receiverEmail: { type: 'string', format: 'email' },
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            note: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { receiverEmail, amount, currency = 'USD', note = 'Financial OS Impact' } = req.body;

      try {
        // 1. Panggil PayPal API via SDK
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
                receiver: receiverEmail,
                note,
                senderItemId: `item_${Date.now()}`,
              },
            ],
          }
        });

        const batchId = response.result.batchHeader?.payoutBatchId || null;

        // 2. Simpan ke database
        const payout = await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail,
          status: 'success', // Asumsikan sukses jika tidak throw error
          paypalBatchId: batchId || undefined,
        });

        return reply.code(201).send({ payout, paypalResponse: response.result });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'PayPal payout failed');
        
        // Simpan status gagal ke DB agar terekam
        await createPayout(fastify.pg, {
          amount,
          currency,
          receiverEmail,
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
