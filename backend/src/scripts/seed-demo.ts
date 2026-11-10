/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/scripts/seed-demo.ts                       │
 * │  Purpose   : Script: seed-demo                                      │
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
 * Seed demo data — realistic US persona.
 * Persona: Sam Rivera · Web Server Administrator @ PayPal (San Jose, CA)
 * Started Jul 2026 · Semi-monthly paychecks (15th + last day) · $3,800/check net
 * US merchants via PayPal (Starbucks, Trader Joe's, Shell, Amazon, etc.)
 */
import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import pg from 'pg';

for (const p of [
  process.env.ENV_FILE,
  resolve(process.cwd(), '../infra/.env'),
  resolve(process.cwd(), 'infra/.env'),
  resolve(process.cwd(), '.env'),
].filter((x): x is string => !!x)) {
  if (existsSync(p)) {
    dotenv.config({ path: p, override: false });
    console.log('[seed] loaded env from', p);
    break;
  }
}

if (process.env.SEED_CONFIRM !== 'yes-wipe-demo-data') {
  console.error('[seed] BLOCKED: set SEED_CONFIRM=yes-wipe-demo-data to proceed.');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('[seed] BLOCKED: DATABASE_URL not set.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

interface Tx {
  rawText: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurredAt: string;
  isProjection?: boolean;
}

const pad = (n: number): string => String(n).padStart(2, '0');

// ───── INCOME ─────
const INCOME = 3800;
const PAYCHECKS = ['07-15','07-31','08-15','08-31','09-15','09-30','10-15','10-31'];

// ───── FIXED RECURRING ─────
interface Recur { day: number; name: string; amt: number; cat: string }
const FIXED: Recur[] = [
  { day: 1,  name: 'rent payment to avalonbay apartments', amt: 2400,   cat: 'utilities' },
  { day: 1,  name: 'planet fitness membership',            amt: 24.99,  cat: 'health' },
  { day: 5,  name: 'comcast xfinity internet',             amt: 79.99,  cat: 'utilities' },
  { day: 8,  name: 'verizon wireless bill',                amt: 85.00,  cat: 'utilities' },
  { day: 10, name: 'state farm auto insurance',            amt: 142.50, cat: 'other' },
  { day: 12, name: 'netflix subscription',                 amt: 15.49,  cat: 'entertainment' },
  { day: 15, name: 'spotify premium',                      amt: 10.99,  cat: 'entertainment' },
];

// ───── VARIABLE (Jul-Nov partial) ─────
// [day, name, amount, category]
const VAR: Record<number, Array<[number, string, number, string]>> = {
  7: [
    [17, 'whole foods market', 127.80, 'food'],
    [18, 'doordash delivery', 42.50, 'food'],
    [19, 'shell gas station', 52.30, 'transport'],
    [20, 'amazon purchase electronics', 89.99, 'shopping'],
    [21, 'starbucks coffee', 7.85, 'food'],
    [23, 'trader joes groceries', 94.20, 'food'],
    [24, 'target household', 67.50, 'shopping'],
    [25, 'chevron gas', 48.40, 'transport'],
    [26, 'cvs pharmacy', 34.15, 'health'],
    [27, 'chipotle mexican grill', 14.75, 'food'],
    [29, 'uber ride', 28.90, 'transport'],
    [30, 'doordash dinner', 36.80, 'food'],
  ],
  8: [
    [2, 'safeway groceries', 103.45, 'food'],
    [4, 'starbucks coffee', 6.95, 'food'],
    [5, 'amazon prime day purchase', 189.99, 'shopping'],
    [7, 'shell gas station', 48.20, 'transport'],
    [9, 'whole foods market', 112.80, 'food'],
    [10, 'chipotle mexican grill', 15.30, 'food'],
    [11, 'best buy electronics', 129.99, 'shopping'],
    [13, 'chevron gas', 45.60, 'transport'],
    [15, 'trader joes groceries', 88.75, 'food'],
    [17, 'doordash delivery', 38.20, 'food'],
    [19, 'cvs pharmacy', 28.50, 'health'],
    [21, 'amazon household supplies', 76.40, 'shopping'],
    [24, 'starbucks coffee', 8.15, 'food'],
    [26, 'safeway groceries', 97.60, 'food'],
    [28, 'uber ride', 32.40, 'transport'],
  ],
  9: [
    [1, 'trader joes groceries', 105.30, 'food'],
    [3, 'shell gas station', 49.80, 'transport'],
    [4, 'starbucks coffee', 7.25, 'food'],
    [6, 'whole foods market', 118.90, 'food'],
    [8, 'doordash delivery', 44.60, 'food'],
    [9, 'target household', 82.40, 'shopping'],
    [11, 'chipotle mexican grill', 15.75, 'food'],
    [13, 'chevron gas', 51.30, 'transport'],
    [15, 'safeway groceries', 99.80, 'food'],
    [17, 'amazon electronics', 149.99, 'shopping'],
    [19, 'cvs pharmacy', 38.75, 'health'],
    [21, 'starbucks coffee', 6.85, 'food'],
    [23, 'whole foods market', 124.50, 'food'],
    [25, 'uber ride', 26.80, 'transport'],
    [27, 'doordash dinner', 41.30, 'food'],
    [29, 'trader joes groceries', 92.40, 'food'],
  ],
  10: [
    [1, 'safeway groceries', 108.20, 'food'],
    [2, 'shell gas station', 50.70, 'transport'],
    [4, 'starbucks coffee', 6.45, 'food'],
    [5, 'amazon household supplies', 73.50, 'shopping'],
    [7, 'whole foods market', 121.30, 'food'],
    [9, 'chipotle mexican grill', 14.80, 'food'],
    [10, 'chevron gas', 49.20, 'transport'],
    [12, 'trader joes groceries', 96.80, 'food'],
    [14, 'doordash delivery', 35.60, 'food'],
    [16, 'cvs pharmacy', 32.15, 'health'],
    [18, 'amazon electronics', 98.99, 'shopping'],
    [20, 'starbucks coffee', 8.30, 'food'],
    [22, 'safeway groceries', 112.40, 'food'],
    [24, 'shell gas station', 47.60, 'transport'],
    [26, 'target household', 64.80, 'shopping'],
    [28, 'uber ride', 29.50, 'transport'],
    [30, 'whole foods market', 127.90, 'food'],
    [31, 'halloween candy target', 24.99, 'shopping'],
  ],
  11: [
    [1, 'safeway groceries', 94.50, 'food'],
    [2, 'shell gas station', 48.20, 'transport'],
    [4, 'starbucks coffee', 7.15, 'food'],
    [5, 'chipotle mexican grill', 15.80, 'food'],
    [7, 'whole foods market', 108.30, 'food'],
    [9, 'trader joes groceries', 87.60, 'food'],
    [10, 'starbucks coffee', 6.90, 'food'],
  ],
};

// ───── PROJECTIONS (Nov 11 - Dec 31, is_projection=true) ─────
const PROJECTIONS: Tx[] = [
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-11-15T09:00:00Z', isProjection: true },
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-11-30T09:00:00Z', isProjection: true },
  { rawText: '[projected] rent payment', amount: 2400, type: 'expense', category: 'utilities', occurredAt: '2026-12-01T10:00:00Z', isProjection: true },
  { rawText: '[projected] comcast xfinity internet', amount: 79.99, type: 'expense', category: 'utilities', occurredAt: '2026-12-05T10:00:00Z', isProjection: true },
  { rawText: '[projected] verizon wireless bill', amount: 85, type: 'expense', category: 'utilities', occurredAt: '2026-12-08T10:00:00Z', isProjection: true },
  { rawText: '[projected] groceries', amount: 110, type: 'expense', category: 'food', occurredAt: '2026-12-03T14:00:00Z', isProjection: true },
  { rawText: '[projected] paypal paycheck direct deposit', amount: 3800, type: 'income', category: 'other', occurredAt: '2026-12-15T09:00:00Z', isProjection: true },
];

// ───── GOALS ─────
const GOALS = [
  { name: 'Emergency Fund',       target: 10000, monthly: 500, rate: 2.5, loan: 0, start: '2026-07-01', dur: 24, prog: 12 },
  { name: 'Hawaii Vacation',      target: 3000,  monthly: 300, rate: 0,   loan: 0, start: '2026-08-01', dur: 10, prog: 6 },
  { name: 'MacBook Pro Upgrade',  target: 2500,  monthly: 200, rate: 0,   loan: 0, start: '2026-09-01', dur: 12, prog: 3 },
];

// ───── ORACLES ─────
const ORACLES = [
  { amount: 2500, period: 'next_month', reason: 'Save for emergency buffer — extra padding' },
  { amount: 600,  period: 'next_week',  reason: 'Weekly net savings target after bills' },
];

async function main() {
  const safe = dbUrl!.replace(/:[^@]+@/, ':***@');
  console.log('[seed] target:', safe);
  console.log('[seed] connecting...');
  await pool.query('SELECT 1');

  console.log('[seed] wiping data...');
  const tables = ['payouts', 'surplus_oracles', 'surplus_periods', 'goals', 'transactions'];
  for (const t of tables) {
    try {
      await pool.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
      console.log('  ✓ wiped', t);
    } catch (e) {
      console.log(`  (skip ${t}: ${(e as Error).message.slice(0, 60)})`);
    }
  }

  // Build transactions
  const txs: Tx[] = [];

  // Income
  for (const md of PAYCHECKS) {
    txs.push({ rawText: 'paypal paycheck direct deposit', amount: INCOME, type: 'income', category: 'other', occurredAt: `2026-${md}T09:00:00Z` });
  }

  // Fixed (Jul through Nov 10 only)
  const months: Array<{ m: number; lastDay: number }> = [
    { m: 7, lastDay: 31 }, { m: 8, lastDay: 31 }, { m: 9, lastDay: 30 },
    { m: 10, lastDay: 31 }, { m: 11, lastDay: 10 },
  ];
  for (const { m, lastDay } of months) {
    for (const f of FIXED) {
      if (m === 11 && f.day > lastDay) continue;
      txs.push({ rawText: f.name, amount: f.amt, type: 'expense', category: f.cat, occurredAt: `2026-${pad(m)}-${pad(f.day)}T10:00:00Z` });
    }
  }

  // Variable
  for (const [mStr, list] of Object.entries(VAR)) {
    const m = Number(mStr);
    for (const [day, name, amt, cat] of list) {
      txs.push({ rawText: name, amount: amt, type: 'expense', category: cat, occurredAt: `2026-${pad(m)}-${pad(day)}T14:00:00Z` });
    }
  }

  // Projections
  txs.push(...PROJECTIONS);

  console.log(`[seed] inserting ${txs.length} transactions...`);
  const CHUNK = 40;
  for (let i = 0; i < txs.length; i += CHUNK) {
    const chunk = txs.slice(i, i + CHUNK);
    const placeholders = chunk.map((_, idx) => {
      const b = idx * 6;
      return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5}::timestamptz,$${b+6})`;
    }).join(',');
    const params: unknown[] = [];
    for (const t of chunk) {
      params.push(t.rawText, t.amount, t.type, t.category, t.occurredAt, t.isProjection ?? false);
    }
    await pool.query(
      `INSERT INTO transactions (raw_text, amount, type, category, occurred_at, is_projection) VALUES ${placeholders}`,
      params,
    );
  }

  // Goals
  for (const g of GOALS) {
    await pool.query(
      `INSERT INTO goals (name, target_amount, monthly_saving, interest_rate, loan_term_months, start_date, duration_months, progress_percent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [g.name, g.target, g.monthly, g.rate, g.loan, g.start, g.dur, g.prog],
    );
  }
  console.log(`[seed] inserted ${GOALS.length} goals`);

  // Oracles
  for (const o of ORACLES) {
    await pool.query(
      `INSERT INTO surplus_oracles (predicted_amount, period, reason) VALUES ($1,$2,$3)`,
      [o.amount, o.period, o.reason],
    );
  }
  console.log(`[seed] inserted ${ORACLES.length} oracles`);

  // Verify
  const c = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM transactions WHERE is_projection=false)::int AS tx_actual,
      (SELECT COUNT(*) FROM transactions WHERE is_projection=true)::int AS tx_projection,
      (SELECT COUNT(*) FROM goals)::int AS goals,
      (SELECT COUNT(*) FROM surplus_oracles)::int AS oracles,
      (SELECT COALESCE(SUM(amount),0)::numeric(15,2) FROM transactions WHERE type='income' AND is_projection=false) AS income,
      (SELECT COALESCE(SUM(amount),0)::numeric(15,2) FROM transactions WHERE type='expense' AND is_projection=false) AS expense
  `);
  console.log('[seed] counts:', JSON.stringify(c.rows[0]));

  const perMonth = await pool.query(`
    SELECT
      TO_CHAR(occurred_at, 'YYYY-MM') AS month,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END)::numeric(15,2) AS inc,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END)::numeric(15,2) AS exp
    FROM transactions WHERE is_projection=false
    GROUP BY 1 ORDER BY 1
  `);
  console.log('[seed] per-month:');
  for (const row of perMonth.rows) {
    console.log(`  ${row.month}: income=$${row.inc}  expense=$${row.exp}`);
  }

  await pool.end();
  console.log('[seed] DONE — total:', txs.length + GOALS.length + ORACLES.length, 'rows');
}

main().catch((e) => {
  console.error('[seed] FAILED:', e);
  process.exit(1);
});
