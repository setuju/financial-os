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

// ---- Create transaction (for Server Action use) ----

export type CreateTransactionResult =
  | { ok: true; transaction: Transaction }
  | { ok: false; error: 'no_amount' | 'invalid_input' | 'zero_amount' | 'network_error' };

export async function createTransaction(text: string): Promise<CreateTransactionResult> {
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      cache: 'no-store',
    });
    if (res.status === 201) {
      const data = (await res.json()) as { transaction: Transaction };
      return { ok: true, transaction: data.transaction };
    }
    if (res.status === 400) {
      const data = (await res.json()) as { error?: string };
      const allowed = ['no_amount', 'invalid_input', 'zero_amount'] as const;
      const err = (allowed as readonly string[]).includes(data.error ?? '')
        ? (data.error as typeof allowed[number])
        : 'invalid_input';
      return { ok: false, error: err };
    }
    return { ok: false, error: 'network_error' };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

// ---- Impact Payouts ----

export type PayoutResponse = {
  payout: {
    id: string;
    receiver_email: string;
    amount: string;
    status: string;
    paypal_batch_id: string;
    created_at: string;
  };
  paypalResponse: {
    batchHeader?: {
      payoutBatchId?: string;
      batchStatus?: string;
    };
    [key: string]: unknown;
  };
};

export async function distributeSurplus(
  receiverEmail: string,
  amount: number,
  currency: string = 'USD'
): Promise<PayoutResponse> {
  const res = await fetch(`${API_URL}/impact/payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverEmail, amount, currency }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Payout failed');
  }
  return res.json();
}
