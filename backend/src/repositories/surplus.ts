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

export async function createPrediction(pool: pg.Pool, predictedAmount: number) {
  const result = await pool.query(
    `INSERT INTO surplus_oracles (predicted_amount) VALUES ($1) RETURNING *`,
    [predictedAmount]
  );
  return result.rows[0];
}

export async function getLatestPrediction(pool: pg.Pool) {
  const result = await pool.query(
    `SELECT * FROM surplus_oracles ORDER BY created_at DESC LIMIT 1`
  );
  return result.rows[0] || null;
}
