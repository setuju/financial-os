/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : backend/src/scripts/migrate.ts                         │
 * │  Purpose   : Script: migrate                                        │
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
 * Standalone migration runner. Reads .sql files from backend/migrations/,
 * applies them in filename order, tracks applied files in _migrations table.
 * Idempotent: skips already-applied files.
 *
 * Usage: pnpm migrate
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenvConfig } from 'dotenv';
import pg from 'pg';

// Load .env from repo root infra/ regardless of CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');
for (const candidate of ['.env', join(repoRoot, 'infra', '.env')]) {
  if (existsSync(candidate)) {
    dotenvConfig({ path: candidate, override: false });
    console.log(`[migrate] loaded env from ${candidate}`);
    break;
  }
}

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[migrate] no .sql files found');
      return;
    }

    for (const file of files) {
      const check = await client.query(
        'SELECT 1 FROM _migrations WHERE filename = $1',
        [file],
      );
      if (check.rowCount && check.rowCount > 0) {
        console.log(`[migrate] skip  ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`[migrate] apply ${file} OK`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    const applied = await client.query('SELECT filename, applied_at FROM _migrations ORDER BY filename');
    console.log(`[migrate] ${applied.rowCount} migration(s) recorded:`);
    for (const row of applied.rows) {
      console.log(`  - ${row.filename} at ${row.applied_at.toISOString()}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[migrate] FAILED:', err);
  // Note: this is a script exit, not an interactive-shell `exit 1` (R2 compliance).
  process.exit(1);
});
