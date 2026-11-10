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

  sourcePeriod?: string;
}

export async function createPayout(pool: pg.Pool, input: CreatePayoutInput): Promise<PayoutRow> {
  const result = await pool.query(
    `INSERT INTO payouts (transaction_id, amount, currency, receiver_email, status, paypal_batch_id, source_period)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
      [
        input.transactionId || null,
        input.amount,
        input.currency,
        input.receiverEmail,
        input.status,
        input.paypalBatchId || null,
        input.sourcePeriod || null,
      ]
  );
  return result.rows[0];
}


export async function listPayouts(
  pool: pg.Pool,
  opts: { includeDeleted?: boolean; limit?: number } = {},
): Promise<unknown[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const where = opts.includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const result = await pool.query(
    `SELECT * FROM payouts ${where} ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

export async function softDeletePayout(
  pool: pg.Pool,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    'UPDATE payouts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}
