/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/repositories/payouts.ts
 * │  Purpose   : Repository: payouts
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

export async function createPayout(pool: pg.Pool, sessionId: string, input: CreatePayoutInput): Promise<PayoutRow> {
  const result = await pool.query(
    `INSERT INTO payouts (transaction_id, amount, currency, receiver_email, status, paypal_batch_id, source_period, session_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
      [
        input.transactionId || null,
        input.amount,
        input.currency,
        input.receiverEmail,
        input.status,
        input.paypalBatchId || null,
        input.sourcePeriod || null,
        sessionId,
      ]
  );
  return result.rows[0];
}


export async function listPayouts(
  pool: pg.Pool,
  sessionId: string,
  opts: { includeDeleted?: boolean; limit?: number } = {},
): Promise<unknown[]> {
  const limit = Math.min(opts.limit ?? 50, 200);
  const deletedClause = opts.includeDeleted ? '' : 'AND deleted_at IS NULL';
  const result = await pool.query(
    `SELECT * FROM payouts WHERE session_id = $1 ${deletedClause} ORDER BY created_at DESC LIMIT $2`,
    [sessionId, limit],
  );
  return result.rows;
}

export async function softDeletePayout(
  pool: pg.Pool,
  sessionId: string,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    'UPDATE payouts SET deleted_at = NOW() WHERE id = $1 AND session_id = $2 AND deleted_at IS NULL RETURNING id',
    [id, sessionId],
  );
  return (result.rowCount ?? 0) > 0;
}
