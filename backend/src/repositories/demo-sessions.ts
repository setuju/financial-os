import type pg from 'pg';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

export const ADMIN_UUID = '00000000-0000-0000-0000-000000000001';
export const ADMIN_NAME = 'admin';
const ADMIN_PASSWORD_DEFAULT = 'financial-os';
const BCRYPT_ROUNDS = 10;

export interface DemoSession {
  id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  last_seen_at: string;
}

function toSession(row: Record<string, unknown>): DemoSession {
  return {
    id: String(row.id),
    name: String(row.name),
    is_admin: Boolean(row.is_admin),
    created_at: String(row.created_at),
    last_seen_at: String(row.last_seen_at),
  };
}

/**
 * Idempotent — ensures the admin session exists.
 * Password hash is re-synced if ADMIN_PASSWORD env changed (or first run).
 * Runs on server startup.
 */
export async function ensureAdminSession(pool: pg.Pool): Promise<void> {
  const password = process.env.ADMIN_PASSWORD ?? ADMIN_PASSWORD_DEFAULT;

  const existing = await pool.query(
    'SELECT id, password_hash FROM demo_sessions WHERE id = $1',
    [ADMIN_UUID],
  );

  if (existing.rows.length === 0) {
    const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
    await pool.query(
      `INSERT INTO demo_sessions (id, name, password_hash, is_admin)
       VALUES ($1, $2, $3, true)`,
      [ADMIN_UUID, ADMIN_NAME, hash],
    );
    // eslint-disable-next-line no-console
    console.info('[demo-sessions] admin bootstrap: created (name=admin)');
    return;
  }

  const currentHash = String(existing.rows[0].password_hash);
  if (!bcrypt.compareSync(password, currentHash)) {
    const newHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
    await pool.query(
      'UPDATE demo_sessions SET password_hash = $1 WHERE id = $2',
      [newHash, ADMIN_UUID],
    );
    // eslint-disable-next-line no-console
    console.info('[demo-sessions] admin bootstrap: password hash rotated');
  }
}

/**
 * Generate 5-char password from unambiguous alphabet
 * (A-Z minus I/O/L, 2-9). ~34^5 ≈ 45M combos — enough for demo.
 */
function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 5; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export interface RegisterResult {
  session: DemoSession;
  password: string;
}

export async function registerSession(
  pool: pg.Pool,
  rawName: string,
): Promise<RegisterResult> {
  const name = rawName.trim();
  if (name.length < 2 || name.length > 40) {
    throw new Error('name_invalid');
  }
  if (name.toLowerCase() === ADMIN_NAME) {
    throw new Error('name_reserved');
  }

  const password = generatePassword();
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  const id = randomUUID();

  try {
    const res = await pool.query(
      `INSERT INTO demo_sessions (id, name, password_hash, is_admin)
       VALUES ($1, $2, $3, false)
       RETURNING id, name, is_admin, created_at, last_seen_at`,
      [id, name, hash],
    );
    return { session: toSession(res.rows[0]), password };
  } catch (err) {
    const pgErr = err as { code?: string };
    if (pgErr.code === '23505') throw new Error('name_taken');
    throw err;
  }
}

export async function verifyLogin(
  pool: pg.Pool,
  rawName: string,
  password: string,
): Promise<DemoSession | null> {
  const name = rawName.trim();
  const res = await pool.query(
    `SELECT id, name, password_hash, is_admin, created_at, last_seen_at
     FROM demo_sessions
     WHERE LOWER(name) = LOWER($1)`,
    [name],
  );
  if (res.rows.length === 0) return null;

  const row = res.rows[0] as Record<string, unknown>;
  const hash = String(row.password_hash);
  if (!bcrypt.compareSync(password, hash)) return null;

  // Touch last_seen (fire and forget)
  pool.query('UPDATE demo_sessions SET last_seen_at = NOW() WHERE id = $1', [
    row.id,
  ]).catch(() => {});

  return toSession(row);
}

export async function verifySession(
  pool: pg.Pool,
  id: string,
): Promise<DemoSession | null> {
  const res = await pool.query(
    `SELECT id, name, is_admin, created_at, last_seen_at
     FROM demo_sessions WHERE id = $1`,
    [id],
  );
  if (res.rows.length === 0) return null;
  return toSession(res.rows[0]);
}
