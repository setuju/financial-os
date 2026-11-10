/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/repositories/reports.ts                    │
 * │  Purpose   : Repo: reports                                          │
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

/**
 * Reports repository — aggregate transactions over time windows.
 * All queries parameterized; no string interpolation of user input.
 *
 * NOTE on weekly grouping: uses PG ISO week (starts Monday).
 * For US-style Sunday start, swap `date_trunc('week', ts)` with
 * `date_trunc('week', ts + interval '1 day') - interval '1 day'`.
 */
import type pg from 'pg';

export type GroupBy = 'day' | 'week' | 'month' | 'year';
export type TypeFilter = 'income' | 'expense' | 'all';

export interface SummaryBucket {
  period: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  isProjection: boolean;
}

export interface SummaryTotals {
  income: number;
  expense: number;
  net: number;
}

export interface SummaryResult {
  buckets: SummaryBucket[];
  totals: SummaryTotals;
}

interface RawBucketRow {
  period: Date;
  income: string;
  expense: string;
  is_projection: boolean;
}

function formatLabel(period: Date, groupBy: GroupBy): string {
  const iso = period.toISOString();
  switch (groupBy) {
    case 'day':
      return iso.slice(0, 10);
    case 'week':
      return `Wk ${iso.slice(0, 10)}`;
    case 'month':
      return iso.slice(0, 7);
    case 'year':
      return iso.slice(0, 4);
  }
}

export async function getSummary(
  pool: pg.Pool,
  opts: {
    from: Date;
    to: Date;
    groupBy: GroupBy;
    type: TypeFilter;
    includeProjections: boolean;
  },
): Promise<SummaryResult> {
  const { from, to, groupBy, type, includeProjections } = opts;

  const typeClause = type === 'all' ? '' : 'AND "type" = $4';
  const projClause = includeProjections ? '' : 'AND is_projection = false';
  const params: unknown[] = [groupBy, from, to];
  if (type !== 'all') params.push(type);

  const sql = `
    SELECT
      date_trunc($1, occurred_at) AS period,
      COALESCE(SUM(CASE WHEN "type" = 'income'  THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN "type" = 'expense' THEN amount ELSE 0 END), 0) AS expense,
      bool_and(is_projection) AS is_projection
    FROM transactions
    WHERE occurred_at >= $2
      AND occurred_at <= $3
      ${typeClause}
      ${projClause}
    GROUP BY period
    ORDER BY period ASC
  `;

  const result = await pool.query<RawBucketRow>(sql, params);

  let totalsIncome = 0;
  let totalsExpense = 0;
  const buckets: SummaryBucket[] = result.rows.map((r) => {
    const income = Number(r.income);
    const expense = Number(r.expense);
    totalsIncome += income;
    totalsExpense += expense;
    return {
      period: r.period.toISOString(),
      label: formatLabel(r.period, groupBy),
      income,
      expense,
      net: income - expense,
      isProjection: r.is_projection,
    };
  });

  return {
    buckets,
    totals: {
      income: totalsIncome,
      expense: totalsExpense,
      net: totalsIncome - totalsExpense,
    },
  };
}
