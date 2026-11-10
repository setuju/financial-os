/**
 * CLI wrapper for runSeed (admin session only).
 * Usage: SEED_CONFIRM=yes-wipe-demo-data pnpm seed
 */
import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import pg from 'pg';
import { runSeed } from '../lib/seed-runner.js';
import { ADMIN_UUID } from '../repositories/demo-sessions.js';

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

const safe = dbUrl.replace(/:[^@]+@/, ':***@');
console.log('[seed] target:', safe);
console.log('[seed] wiping + seeding admin session...');
const result = await runSeed(pool, ADMIN_UUID);
console.log('[seed] result:', JSON.stringify(result));

const v = await pool.query(
  `SELECT COUNT(*)::int AS n FROM transactions WHERE session_id = $1`,
  [ADMIN_UUID],
);
console.log('[seed] admin transactions:', v.rows[0].n);

await pool.end();
console.log('[seed] DONE');
