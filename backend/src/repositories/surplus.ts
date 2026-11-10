import type pg from 'pg';

export interface SurplusMetrics {
  totalIncome: number;
  totalExpense: number;
  currentSurplus: number;
}

// Menghitung surplus total (Income - Expense) dari semua transaksi
export async function calculateSurplus(pool: pg.Pool): Promise<SurplusMetrics> {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
    FROM transactions
    WHERE is_projection = false
  `);

  const row = result.rows[0];
  const totalIncome = Number(row.total_income);
  const totalExpense = Number(row.total_expense);

  return {
    totalIncome,
    totalExpense,
    currentSurplus: totalIncome - totalExpense,
  };
}

export async function createPrediction(pool: pg.Pool, data: { predictedAmount: number, period: string, reason: string }) {
  const result = await pool.query(
    `INSERT INTO surplus_oracles (predicted_amount, period, reason) VALUES ($1, $2, $3) RETURNING *`,
    [data.predictedAmount, data.period, data.reason]
  );
  return result.rows[0];
}

export async function getLatestPrediction(pool: pg.Pool) {
  const result = await pool.query(
    `SELECT * FROM surplus_oracles ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}

export async function listPredictions(pool: pg.Pool) {
  const result = await pool.query(
    `SELECT * FROM surplus_oracles ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function updatePrediction(pool: pg.Pool, id: string, data: { predictedAmount: number, period: string, reason: string }) {
  const result = await pool.query(
    `UPDATE surplus_oracles SET predicted_amount = $1, period = $2, reason = $3 WHERE id = $4 RETURNING *`,
    [data.predictedAmount, data.period, data.reason, id]
  );
  return result.rows[0] || null;
}

export async function deletePrediction(pool: pg.Pool, id: string) {
  const result = await pool.query(
    `DELETE FROM surplus_oracles WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows.length > 0;
}


export async function markPredictionAchieved(pool: pg.Pool, id: string) {
  const result = await pool.query(
    `UPDATE surplus_oracles
     SET status = 'resolved', resolved_at = NOW(), achieved_at = NOW(),
         actual_amount = predicted_amount
     WHERE id = $1 AND status != 'resolved'
     RETURNING *`,
    [id],
  );
  return result.rows[0] || null;
}
