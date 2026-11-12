/**
 * Seed runner — extracted from scripts/seed-demo.ts.
 * Session-aware: wipes only THIS session's data, re-inserts with session_id.
 * Called by: scripts/seed-demo.ts (CLI), routes/admin.ts (POST /demo/reset).
 */
import type pg from 'pg';
import type { Client as ElasticClient } from '@elastic/elasticsearch';
import { ensureSurplusPeriods, currentMonth } from '../repositories/surplus-periods.js';

interface Tx {
  rawText: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurredAt: string;
  isProjection?: boolean;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const INCOME = 3800;
const PAYCHECKS = ['07-15', '07-31', '08-15', '08-31', '09-15', '09-30', '10-15', '10-31'];

interface Recur {
  day: number;
  name: string;
  amt: number;
  cat: string;
}
const FIXED: Recur[] = [
  { day: 1, name: 'rent payment to avalonbay apartments', amt: 2400, cat: 'utilities' },
  { day: 1, name: 'planet fitness membership', amt: 24.99, cat: 'fitness' },
  { day: 5, name: 'comcast xfinity internet', amt: 79.99, cat: 'utilities' },
  { day: 8, name: 'verizon wireless bill', amt: 85.0, cat: 'utilities' },
  { day: 10, name: 'state farm auto insurance', amt: 142.5, cat: 'utilities' },
  { day: 12, name: 'netflix subscription', amt: 15.49, cat: 'subscription' },
  { day: 15, name: 'spotify premium', amt: 10.99, cat: 'subscription' },
];

const VAR: Record<number, Array<[number, string, number, string]>> = {
  7: [
    [17, 'whole foods market', 127.8, 'groceries'],
    [18, 'doordash delivery', 42.5, 'food'],
    [19, 'shell gas station', 52.3, 'transport'],
    [20, 'amazon purchase electronics', 89.99, 'shopping'],
    [21, 'starbucks coffee', 7.85, 'food'],
    [23, 'trader joes groceries', 94.2, 'groceries'],
    [24, 'target household', 67.5, 'shopping'],
    [25, 'chevron gas', 48.4, 'transport'],
    [26, 'cvs pharmacy', 34.15, 'health'],
    [27, 'chipotle mexican grill', 14.75, 'food'],
    [29, 'uber ride', 28.9, 'transport'],
    [30, 'doordash dinner', 36.8, 'food'],
  ],
  8: [
    [2, 'safeway groceries', 103.45, 'groceries'],
    [4, 'starbucks coffee', 6.95, 'food'],
    [5, 'amazon prime day purchase', 189.99, 'shopping'],
    [7, 'shell gas station', 48.2, 'transport'],
    [9, 'whole foods market', 112.8, 'groceries'],
    [10, 'chipotle mexican grill', 15.3, 'food'],
    [11, 'best buy electronics', 129.99, 'shopping'],
    [13, 'chevron gas', 45.6, 'transport'],
    [15, 'trader joes groceries', 88.75, 'groceries'],
    [17, 'doordash delivery', 38.2, 'food'],
    [19, 'cvs pharmacy', 28.5, 'health'],
    [21, 'amazon household supplies', 76.4, 'shopping'],
    [24, 'starbucks coffee', 8.15, 'food'],
    [26, 'safeway groceries', 97.6, 'groceries'],
    [28, 'uber ride', 32.4, 'transport'],
  ],
  9: [
    [1, 'trader joes groceries', 105.3, 'groceries'],
    [3, 'shell gas station', 49.8, 'transport'],
    [4, 'starbucks coffee', 7.25, 'food'],
    [6, 'whole foods market', 118.9, 'groceries'],
    [8, 'doordash delivery', 44.6, 'food'],
    [9, 'target household', 82.4, 'shopping'],
    [11, 'chipotle mexican grill', 15.75, 'food'],
    [13, 'chevron gas', 51.3, 'transport'],
    [15, 'safeway groceries', 99.8, 'groceries'],
    [17, 'amazon electronics', 149.99, 'shopping'],
    [19, 'cvs pharmacy', 38.75, 'health'],
    [21, 'starbucks coffee', 6.85, 'food'],
    [23, 'whole foods market', 124.5, 'groceries'],
    [25, 'uber ride', 26.8, 'transport'],
    [27, 'doordash dinner', 41.3, 'food'],
    [29, 'trader joes groceries', 92.4, 'groceries'],
  ],
  10: [
    [1, 'safeway groceries', 108.2, 'groceries'],
    [2, 'shell gas station', 50.7, 'transport'],
    [4, 'starbucks coffee', 6.45, 'food'],
    [5, 'amazon household supplies', 73.5, 'shopping'],
    [7, 'whole foods market', 121.3, 'groceries'],
    [9, 'chipotle mexican grill', 14.8, 'food'],
    [10, 'chevron gas', 49.2, 'transport'],
    [12, 'trader joes groceries', 96.8, 'groceries'],
    [14, 'doordash delivery', 35.6, 'food'],
    [16, 'cvs pharmacy', 32.15, 'health'],
    [18, 'amazon electronics', 98.99, 'shopping'],
    [20, 'starbucks coffee', 8.3, 'food'],
    [22, 'safeway groceries', 112.4, 'groceries'],
    [24, 'shell gas station', 47.6, 'transport'],
    [26, 'target household', 64.8, 'shopping'],
    [28, 'uber ride', 29.5, 'transport'],
    [30, 'whole foods market', 127.9, 'groceries'],
    [31, 'halloween candy target', 24.99, 'shopping'],
  ],
  11: [
    [1, 'safeway groceries', 94.5, 'groceries'],
    [2, 'shell gas station', 48.2, 'transport'],
    [3, 'new monitor for design project', 300, 'shopping'],
    [4, 'starbucks coffee', 7.15, 'food'],
    [5, 'chipotle mexican grill', 15.8, 'food'],
    [6, 'netflix subscription', 15.49, 'subscription'],
    [7, 'whole foods market', 108.3, 'groceries'],
    [8, 'dividend from index funds', 150.5, 'investment'],
    [9, 'trader joes groceries', 87.6, 'groceries'],
    [10, 'starbucks coffee', 6.9, 'food'],
  ],
};

const PROJECTIONS: Tx[] = [
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-11-15T09:00:00Z', isProjection: true },
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-11-30T09:00:00Z', isProjection: true },
  { rawText: '[projected] rent payment', amount: 2400, type: 'expense', category: 'utilities', occurredAt: '2026-12-01T10:00:00Z', isProjection: true },
  { rawText: '[projected] comcast xfinity internet', amount: 79.99, type: 'expense', category: 'utilities', occurredAt: '2026-12-05T10:00:00Z', isProjection: true },
  { rawText: '[projected] verizon wireless bill', amount: 85, type: 'expense', category: 'utilities', occurredAt: '2026-12-08T10:00:00Z', isProjection: true },
  { rawText: '[projected] groceries', amount: 110, type: 'expense', category: 'groceries', occurredAt: '2026-12-03T14:00:00Z', isProjection: true },
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-12-15T09:00:00Z', isProjection: true },
];

const GOALS = [
  { name: 'Emergency Fund', target: 10000, monthly: 500, rate: 2.5, loan: 0, start: '2026-07-01', dur: 24, prog: 12 },
  { name: 'Hawaii Vacation', target: 3000, monthly: 300, rate: 0, loan: 0, start: '2026-08-01', dur: 10, prog: 6 },
  { name: 'MacBook Pro Upgrade', target: 2500, monthly: 200, rate: 0, loan: 0, start: '2026-09-01', dur: 12, prog: 3 },
];

const ORACLES = [
  { amount: 2500, period: 'next_month', reason: 'Save for emergency buffer — extra padding' },
  { amount: 600, period: 'next_week', reason: 'Weekly net savings target after bills' },
];

export interface SeedResult {
  transactions: number;
  goals: number;
  oracles: number;
  periods: number;
}

export interface SeedOptions {
  withData?: boolean; // default: true
}

/**
 * Wipes session data (5 tables) + optional re-seed.
 * Session-scoped: never touches other sessions' rows.
 */
export async function runSeed(
  pool: pg.Pool,
  sessionId: string,
  opts: SeedOptions = {},
  esClient?: ElasticClient,
): Promise<SeedResult> {
  const withData = opts.withData ?? true;

  // Wipe only this session's data. Order matters for FK: payouts → oracles → periods → goals → tx
  const tables = ['payouts', 'surplus_oracles', 'surplus_periods', 'goals', 'transactions'];
      for (const t of tables) {
      await pool.query(`DELETE FROM ${t} WHERE session_id = $1`, [sessionId]);
    }
    
    // Wipe Elasticsearch data for this session to prevent duplicates
    if (esClient) {
      try {
        await esClient.deleteByQuery({
          index: 'transactions',
          query: { term: { session_id: sessionId } },
          refresh: true
        });
      } catch (err) {
        console.error('[Seed ES Cleanup] Failed to delete old ES data:', err);
      }
    }

    if (!withData) {
      return { transactions: 0, goals: 0, oracles: 0, periods: 0 };
    }

  // ─── Build transactions ───
  const txs: Tx[] = [
    
    { rawText: 'dividend from index funds', amount: 150.5, type: 'income', category: 'investment', occurredAt: '2026-11-08T10:00:00Z' },
    { rawText: 'bonus from boss', amount: 500, type: 'income', category: 'bonus', occurredAt: '2026-11-10T10:00:00Z' },
    { rawText: 'received pocket money from mom', amount: 200, type: 'income', category: 'pocket_money', occurredAt: '2026-11-12T02:00:00Z' },
  ];

  for (const md of PAYCHECKS) {
    txs.push({
      rawText: 'paypal paycheck direct deposit',
      amount: INCOME,
      type: 'income',
      category: 'income',
      occurredAt: `2026-${md}T09:00:00Z`,
    });
  }

  const months: Array<{ m: number; lastDay: number }> = [
    { m: 7, lastDay: 31 }, { m: 8, lastDay: 31 }, { m: 9, lastDay: 30 },
    { m: 10, lastDay: 31 }, { m: 11, lastDay: 10 },
  ];
  for (const { m, lastDay } of months) {
    for (const f of FIXED) {
      if (m === 11 && f.day > lastDay) continue;
      txs.push({
        rawText: f.name,
        amount: f.amt,
        type: 'expense',
        category: f.cat,
        occurredAt: `2026-${pad(m)}-${pad(f.day)}T10:00:00Z`,
      });
    }
  }

  for (const [mStr, list] of Object.entries(VAR)) {
    const m = Number(mStr);
    for (const [day, name, amt, cat] of list) {
      txs.push({
        rawText: name,
        amount: amt,
        type: 'expense',
        category: cat,
        occurredAt: `2026-${pad(m)}-${pad(day)}T14:00:00Z`,
      });
    }
  }

  txs.push(...PROJECTIONS);

  // ─── Insert transactions (7 params per row: +session_id) ───
  const CHUNK = 40;
  for (let i = 0; i < txs.length; i += CHUNK) {
    const chunk = txs.slice(i, i + CHUNK);
    const placeholders = chunk
      .map((_, idx) => {
        const b = idx * 7;
        return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5}::timestamptz,$${b + 6},$${b + 7})`;
      })
      .join(',');
    const params: unknown[] = [];
    for (const t of chunk) {
      params.push(t.rawText, t.amount, t.type, t.category, t.occurredAt, t.isProjection ?? false, sessionId);
    }
    const res = await pool.query(
            `INSERT INTO transactions (raw_text, amount, type, category, occurred_at, is_projection, session_id) VALUES ${placeholders} RETURNING id, raw_text, amount, type, category, occurred_at`,
            params,
          );

          if (esClient && res.rows.length > 0) {
            const operations = res.rows.flatMap((doc) => [
              { index: { _index: 'transactions', _id: doc.id } },
              { 
                raw_text: doc.raw_text, 
                category: doc.category, 
                type: doc.type, 
                amount: Number(doc.amount), 
                occurred_at: doc.occurred_at, 
                session_id: sessionId 
              }
            ]);
            await esClient.bulk({ operations }).catch(err => console.error('[Seed ES Sync] Bulk failed:', err));
          }
  }

  // ─── Goals ───
  for (const g of GOALS) {
    await pool.query(
      `INSERT INTO goals (name, target_amount, monthly_saving, interest_rate, loan_term_months, start_date, duration_months, progress_percent, session_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [g.name, g.target, g.monthly, g.rate, g.loan, g.start, g.dur, g.prog, sessionId],
    );
  }

  // ─── Oracles ───
  for (const o of ORACLES) {
    await pool.query(
      `INSERT INTO surplus_oracles (predicted_amount, period, reason, session_id) VALUES ($1,$2,$3,$4)`,
      [o.amount, o.period, o.reason, sessionId],
    );
  }

  // ─── Recompute surplus_periods ───
  const periods = await ensureSurplusPeriods(pool, sessionId, currentMonth());

  return {
    transactions: txs.length,
    goals: GOALS.length,
    oracles: ORACLES.length,
    periods: periods.length,
  };
}
