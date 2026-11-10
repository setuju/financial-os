/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/repositories/surplus.ts
 * │  Purpose   : Repository: surplus
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

export interface SurplusMetrics {
  totalIncome: number;
  totalExpense: number;
  currentSurplus: number;
}

// Menghitung surplus total (Income - Expense) dari semua transaksi
export async function calculateSurplus(pool: pg.Pool, sessionId: string): Promise<SurplusMetrics> {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
    WHERE is_projection = false
      AND session_id = $1
  `, [sessionId]);

  const row = result.rows[0];
  const totalIncome = Number(row.total_income);
  const totalExpense = Number(row.total_expense);

  return {
    totalIncome,
    totalExpense,
    currentSurplus: totalIncome - totalExpense,
  };
}

export async function createPrediction(pool: pg.Pool, sessionId: string, data: { predictedAmount: number, period: string, reason: string }) {
  const result = await pool.query(
    `INSERT INTO surplus_oracles (predicted_amount, period, reason, session_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.predictedAmount, data.period, data.reason, sessionId]
  );
  return result.rows[0];
}

export async function getLatestPrediction(pool: pg.Pool, sessionId: string) {
  const result = await pool.query(
    `SELECT * FROM surplus_oracles WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [sessionId]
  );
  return result.rows[0] || null;
}

export async function listPredictions(pool: pg.Pool, sessionId: string) {
  const result = await pool.query(
    `SELECT * FROM surplus_oracles WHERE session_id = $1 ORDER BY created_at DESC`,
    [sessionId]
  );
  return result.rows;
}

export async function updatePrediction(pool: pg.Pool, sessionId: string, id: string, data: { predictedAmount: number, period: string, reason: string }) {
  const result = await pool.query(
    `UPDATE surplus_oracles SET predicted_amount = $1, period = $2, reason = $3 WHERE id = $4 AND session_id = $5 RETURNING *`,
    [data.predictedAmount, data.period, data.reason, id, sessionId]
  );
  return result.rows[0] || null;
}

export async function deletePrediction(pool: pg.Pool, sessionId: string, id: string) {
  const result = await pool.query(
    `DELETE FROM surplus_oracles WHERE id = $1 AND session_id = $2 RETURNING id`,
    [id, sessionId]
  );
  return result.rows.length > 0;
}


export async function markPredictionAchieved(pool: pg.Pool, sessionId: string, id: string) {
  const result = await pool.query(
    `UPDATE surplus_oracles
     SET status = 'resolved', resolved_at = NOW(), achieved_at = NOW(),
         actual_amount = predicted_amount
     WHERE id = $1 AND session_id = $2 AND status != 'resolved'
     RETURNING *`,
    [id, sessionId],
  );
  return result.rows[0] || null;
}
