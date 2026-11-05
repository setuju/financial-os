import type pg from 'pg';

export interface PayoutRow {
  id: string;
  transaction_id: string | null;
  amount: number;
  currency: string;
  receiver_email: string;
  status: 'pending' | 'success' | 'failed';
  paypal_batch_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePayoutInput {
  transactionId?: string;
  amount: number;
  currency: string;
  receiverEmail: string;
  status: 'pending' | 'success' | 'failed';
  paypalBatchId?: string;
}

export async function createPayout(pool: pg.Pool, input: CreatePayoutInput): Promise<PayoutRow> {
  const result = await pool.query(
    `INSERT INTO payouts (transaction_id, amount, currency, receiver_email, status, paypal_batch_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.transactionId || null,
      input.amount,
      input.currency,
      input.receiverEmail,
      input.status,
      input.paypalBatchId || null,
    ]
  );
  return result.rows[0];
}
