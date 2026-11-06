/**
 * Seed demo data — USD, 90 days historical + 60 days projection + 3 goals.
 *
 * DESTRUCTIVE: wipes transactions, surplus_oracles, payouts, goals.
 * Requires env: SEED_CONFIRM=yes-wipe-demo-data
 *
 * Usage:
 *   SEED_CONFIRM=yes-wipe-demo-data pnpm seed
 *   (uses DATABASE_URL from .env, override with explicit env var if needed)
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

const masked = dbUrl.replace(/:\/\/([^@]+)@/, '://***@');
console.log('[seed] target DB:', masked);

const pool = new pg.Pool({ connectionString: dbUrl, connectionTimeoutMillis: 10_000 });

type Row = {
  raw_text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurred_at: Date;
  source: 'rule' | 'llm';
  is_projection: boolean;
};

function d(offsetDays: number, hour = 12): Date {
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + offsetDays);
  base.setUTCHours(hour, 0, 0, 0);
  return base;
}

function buildHistorical(): Row[] {
  const rows: Row[] = [];
  for (let i = -90; i <= 0; i++) {
    const dt = d(i);
    const dayOfMonth = dt.getUTCDate();
    const dayOfWeek = dt.getUTCDay();
    if (dayOfMonth === 1) {
      rows.push({ raw_text: 'monthly salary', amount: 3000, type: 'income', category: 'other', occurred_at: dt, source: 'rule', is_projection: false });
      rows.push({ raw_text: 'rent payment', amount: 1200, type: 'expense', category: 'utilities', occurred_at: dt, source: 'rule', is_projection: false });
    }
    if (dayOfMonth === 5) {
      rows.push({ raw_text: 'utility bill', amount: 120, type: 'expense', category: 'utilities', occurred_at: dt, source: 'rule', is_projection: false });
    }
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      rows.push({ raw_text: 'morning coffee', amount: 8, type: 'expense', category: 'food', occurred_at: dt, source: 'rule', is_projection: false });
    }
    if (dayOfWeek === 6) {
      rows.push({ raw_text: 'weekly groceries', amount: 95, type: 'expense', category: 'food', occurred_at: dt, source: 'rule', is_projection: false });
    }
  }
  return rows;
}

function buildProjection(): Row[] {
  const rows: Row[] = [];
  for (let i = 1; i <= 60; i++) {
    const dt = d(i);
    const dayOfMonth = dt.getUTCDate();
    const dayOfWeek = dt.getUTCDay();
    if (dayOfMonth === 1) {
      rows.push({ raw_text: '[projected] monthly salary', amount: 3000, type: 'income', category: 'other', occurred_at: dt, source: 'rule', is_projection: true });
      rows.push({ raw_text: '[projected] rent payment', amount: 1200, type: 'expense', category: 'utilities', occurred_at: dt, source: 'rule', is_projection: true });
    }
    if (dayOfMonth === 5) {
      rows.push({ raw_text: '[projected] utility bill', amount: 130, type: 'expense', category: 'utilities', occurred_at: dt, source: 'rule', is_projection: true });
    }
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      rows.push({ raw_text: '[projected] coffee', amount: 9, type: 'expense', category: 'food', occurred_at: dt, source: 'rule', is_projection: true });
    }
    if (dayOfWeek === 6) {
      rows.push({ raw_text: '[projected] groceries', amount: 100, type: 'expense', category: 'food', occurred_at: dt, source: 'rule', is_projection: true });
    }
  }
  return rows;
}

async function main() {
  console.log('[seed] connecting...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('[seed] wiping demo data...');
    await client.query('TRUNCATE TABLE transactions, surplus_oracles, payouts, goals RESTART IDENTITY CASCADE');

    const rows = [...buildHistorical(), ...buildProjection()];
    console.log('[seed] inserting', rows.length, 'transactions...');

    const rawTexts = rows.map((r) => r.raw_text);
    const amounts = rows.map((r) => r.amount);
    const types = rows.map((r) => r.type);
    const categories = rows.map((r) => r.category);
    const occurredAts = rows.map((r) => r.occurred_at.toISOString());
    const sources = rows.map((r) => r.source);
    const projections = rows.map((r) => r.is_projection);

    await client.query(
      `INSERT INTO transactions (raw_text, amount, type, category, occurred_at, source, is_projection)
       SELECT * FROM unnest(
         $1::text[], $2::numeric[], $3::text[], $4::text[],
         $5::timestamptz[], $6::text[], $7::boolean[]
       )`,
      [rawTexts, amounts, types, categories, occurredAts, sources, projections],
    );

    console.log('[seed] inserting 3 goals...');
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    await client.query(
      `INSERT INTO goals (name, target_amount, monthly_saving, interest_rate, loan_term_months, start_date, duration_months, progress_percent)
       VALUES
         ($1,$2,$3,$4,$5,$6,$7,$8),
         ($9,$10,$11,$12,$13,$14,$15,$16),
         ($17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        'Emergency Fund',       10000, 833, 2.5, 0,  todayStr, 12, 25,
        'New Car Down Payment',  5000, 500, 0,   36, todayStr, 10, 10,
        'House Down Payment',   20000, 800, 1.5, 0,  todayStr, 24,  5,
      ],
    );

    await client.query('COMMIT');
    console.log('[seed] DONE. inserted', rows.length, 'transactions + 3 goals.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[seed] FAILED:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
