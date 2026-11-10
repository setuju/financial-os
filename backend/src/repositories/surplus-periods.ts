/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/repositories/surplus-periods.ts            │
 * │  Purpose   : Repo: surplus-periods                                  │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

import type pg from 'pg';

export interface SurplusPeriod {
  id: string;
  period_month: string;  // YYYY-MM-DD (first of month)
  opening_balance: string;
  total_income: string;
  total_expense: string;
  horizon_bills: string;
  donations: string;
  closing_surplus: string;
  status: 'open' | 'closed';
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

function monthStart(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function monthEnd(monthStart: string): Date {
  const d = new Date(monthStart + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

/**
 * Compute a single month's metrics from source data.
 * income/expense from transactions WHERE NOT is_projection.
 * horizon = sum of goals.monthly_saving for goals overlapping this month.
 * donations = sum of payouts WHERE source_period = this month AND status='success'
 *   (includes soft-deleted: money is gone)
 */
async function computeMonthMetrics(
  pool: pg.Pool,
  month: string,
): Promise<{ income: number; expense: number; horizon: number; donations: number }> {
  const start = month;
  const end = monthEnd(month).toISOString().slice(0, 10);

  const txResult = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense
     FROM transactions
     WHERE is_projection = false
       AND occurred_at >= $1 AND occurred_at < $2`,
    [start, end],
  );

  const goalsResult = await pool.query(
    `SELECT COALESCE(SUM(monthly_saving), 0) AS horizon
     FROM goals
     WHERE start_date < $2
       AND (start_date + (COALESCE(duration_months, 1) || ' months')::interval) > $1`,
    [start, end],
  );

  const donationsResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS donations
     FROM payouts
     WHERE source_period = $1 AND status = 'success'`,
    [start],
  );

  return {
    income: Number(txResult.rows[0].income),
    expense: Number(txResult.rows[0].expense),
    horizon: Number(goalsResult.rows[0].horizon),
    donations: Number(donationsResult.rows[0].donations),
  };
}

/**
 * Recompute a single period + cascade forward.
 * Persists to surplus_periods.
 */
export async function recomputeSurplusPeriod(
  pool: pg.Pool,
  month: string,
): Promise<SurplusPeriod> {
  // opening = previous month's closing (or 0)
  const prevMonth = new Date(month + 'T00:00:00Z');
  prevMonth.setUTCMonth(prevMonth.getUTCMonth() - 1);
  const prevMonthStr = monthStart(prevMonth);

  const prev = await pool.query(
    'SELECT closing_surplus FROM surplus_periods WHERE period_month = $1',
    [prevMonthStr],
  );
  const opening = prev.rows[0] ? Number(prev.rows[0].closing_surplus) : 0;

  const m = await computeMonthMetrics(pool, month);
  const closing = opening + m.income - m.expense - m.horizon - m.donations;

  const nowUtc = new Date();
  const currentMonthStartUtc = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), 1));
  const status = new Date(month + 'T00:00:00Z') < currentMonthStartUtc ? 'closed' : 'open';

  const result = await pool.query(
    `INSERT INTO surplus_periods
       (period_month, opening_balance, total_income, total_expense, horizon_bills, donations, closing_surplus, status, closed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (period_month) DO UPDATE SET
       opening_balance = EXCLUDED.opening_balance,
       total_income = EXCLUDED.total_income,
       total_expense = EXCLUDED.total_expense,
       horizon_bills = EXCLUDED.horizon_bills,
       donations = EXCLUDED.donations,
       closing_surplus = EXCLUDED.closing_surplus,
       status = EXCLUDED.status,
       closed_at = COALESCE(surplus_periods.closed_at, EXCLUDED.closed_at),
       updated_at = NOW()
     RETURNING *`,
    [month, opening, m.income, m.expense, m.horizon, m.donations, closing, status, status === 'closed' ? new Date() : null],
  );

  return result.rows[0];
}

/**
 * Ensure all periods from earliest tx to `throughMonth` exist + recomputed.
 */
export async function ensureSurplusPeriods(
  pool: pg.Pool,
  throughMonth: string,
): Promise<SurplusPeriod[]> {
  const earliest = await pool.query(
    `SELECT MIN(occurred_at)::date AS e FROM transactions WHERE is_projection = false`,
  );
  const start = earliest.rows[0].e ? monthStart(earliest.rows[0].e) : monthStart(new Date());
  const end = monthStart(throughMonth);

  const months: string[] = [];
  const cur = new Date(start + 'T00:00:00Z');
  const endDate = new Date(end + 'T00:00:00Z');
  while (cur <= endDate) {
    months.push(monthStart(cur));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }

  const results: SurplusPeriod[] = [];
  for (const m of months) {
    results.push(await recomputeSurplusPeriod(pool, m));
  }
  return results;
}

/**
 * Get a single period, computing if missing.
 */
export async function getSurplusPeriod(
  pool: pg.Pool,
  month: string,
): Promise<SurplusPeriod> {
  const existing = await pool.query(
    'SELECT * FROM surplus_periods WHERE period_month = $1',
    [month],
  );
  if (existing.rows[0]) return existing.rows[0];
  return recomputeSurplusPeriod(pool, month);
}

/**
 * After a donation change, cascade recompute forward from `month`.
 */
export async function cascadeFrom(pool: pg.Pool, month: string): Promise<void> {
  // Recompute through `month` (or current month if month is in future).
  // ensureSurplusPeriods walks chronologically → opening_balance cascades correctly.
  const cur = currentMonth();
  const through = month > cur ? cur : month;
  await ensureSurplusPeriods(pool, through);
}

export function currentMonth(): string {
  return monthStart(new Date());
}

export function lastMonth(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return monthStart(d);
}
