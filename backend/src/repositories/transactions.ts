/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : backend/src/repositories/transactions.ts
 * │  Purpose   : Repository: transactions
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/backend
 * @license   MIT
 */

/**
 * Transactions repository. Thin data-access layer over pg Pool.
 * Kept separate from routes so unit tests can hit repo with a mocked pool.
 *
 * Note: pg returns NUMERIC as string to preserve precision. We convert to
 * number here — safe because NUMERIC(15,2) max ~9.99e13 < Number.MAX_SAFE_INTEGER.
 */
import type pg from 'pg';
import type { ParsedTransaction } from '../surplus/parser.js';

export interface TransactionRow {
  id: string;
  user_id: string | null;
  raw_text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurred_at: Date;
  source: 'rule' | 'llm' | 'manual_edit' | 'payout';
  created_at: Date;
}

export interface InsertInput {
  userId?: string | null;
  parsed: ParsedTransaction;
}

export interface ListOptions {
  limit: number;
  offset: number;
}

interface RawRow {
  id: string;
  user_id: string | null;
  raw_text: string;
  amount: string; // NUMERIC → string from pg
  type: 'income' | 'expense';
  category: string;
  occurred_at: Date;
  source: 'rule' | 'llm' | 'manual_edit' | 'payout';
  created_at: Date;
}

function mapRow(row: RawRow): TransactionRow {
  return {
    id: row.id,
    user_id: row.user_id,
    raw_text: row.raw_text,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    occurred_at: row.occurred_at,
    source: row.source,
    created_at: row.created_at,
  };
}

export async function insertTransaction(
  pool: pg.Pool,
  sessionId: string,
  input: InsertInput,
): Promise<TransactionRow> {
  const { parsed, userId = null } = input;
  const result = await pool.query<RawRow>(
    `INSERT INTO transactions (user_id, raw_text, amount, type, category, occurred_at, source, session_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, raw_text, amount, type, category, occurred_at, source, created_at`,
    [
      userId,
      parsed.rawText,
      parsed.amount,
      parsed.type,
      parsed.category,
      parsed.occurredAt,
      parsed.source,
      sessionId,
    ],
  );
  return mapRow(result.rows[0]);
}

export async function listTransactions(
  pool: pg.Pool,
  sessionId: string,
  opts: ListOptions,
): Promise<TransactionRow[]> {
  const result = await pool.query<RawRow>(
    `SELECT id, user_id, raw_text, amount, type, category, occurred_at, source, created_at
     FROM transactions
     WHERE session_id = $1
     ORDER BY occurred_at DESC, created_at DESC
     LIMIT $2 OFFSET $3`,
    [sessionId, opts.limit, opts.offset],
  );
  return result.rows.map(mapRow);
}


export interface UpdateTransactionInput {
  rawText: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export async function updateTransaction(
  pool: pg.Pool,
  sessionId: string,
  id: string,
  input: UpdateTransactionInput,
): Promise<unknown | null> {
  const result = await pool.query(
    `UPDATE transactions
     SET raw_text = $1, amount = $2, type = $3, category = $4, source = 'rule'
     WHERE id = $5 AND session_id = $6
     RETURNING *`,
    [input.rawText, input.amount, input.type, input.category, id, sessionId],
  );
  return result.rows[0] ?? null;
}
