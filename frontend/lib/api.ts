export type HealthResponse = {
  status: 'ok' | 'degraded';
  pg: 'ok' | 'fail';
  redis: 'ok' | 'fail';
  uptime: number;
  latencyMs: number;
};

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

// ---- Transactions ----

export type Transaction = {
  id: string;
  user_id: string | null;
  raw_text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurred_at: string;  // ISO 8601
  source: 'rule' | 'llm';
  created_at: string;   // ISO 8601
};

export type TransactionsResponse = {
  transactions: Transaction[];
  count: number;
  limit: number;
  offset: number;
};

export async function getTransactions(limit = 50): Promise<Transaction[] | null> {
  try {
    const res = await fetch(`${API_URL}/transactions?limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TransactionsResponse;
    return data.transactions;
  } catch {
    return null;
  }
}
