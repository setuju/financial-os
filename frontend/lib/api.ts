export type HealthResponse = {
  status: 'ok' | 'degraded';
  pg: 'ok' | 'fail';
  redis: 'ok' | 'fail';
  uptime: number;
  latencyMs: number;
};

// Server components: hit backend directly (API_URL from Vercel env).
// Client components: use same-origin proxy /api/proxy/* so we don't need
// NEXT_PUBLIC_API_URL in the bundle nor CORS for browser fetches.
const IS_SERVER = typeof window === 'undefined';
const API_URL = IS_SERVER
  ? (process.env.API_URL ?? 'http://localhost:3001')
  : '/api/proxy';

export async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
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
  is_projection?: boolean;
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
      signal: AbortSignal.timeout(5000),
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
  | { ok: false; error: 'no_amount' | 'invalid_input' | 'zero_amount' | 'negated_input' | 'planned_input' | 'network_error' };

export async function createTransaction(text: string): Promise<CreateTransactionResult> {
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 201) {
      const data = (await res.json()) as { transaction: Transaction };
      return { ok: true, transaction: data.transaction };
    }
    if (res.status === 400) {
      const data = (await res.json()) as { error?: string };
      const allowed = ['no_amount', 'invalid_input', 'zero_amount', 'negated_input', 'planned_input'] as const;
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


export type ImpactReceiver = {
  id: string;
  name: string;
  category: string;
  email: string;
};

export async function getImpactReceivers(): Promise<{ receivers: ImpactReceiver[] } | null> {
  try {
    const res = await fetch(`${API_URL}/impact/receivers`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function distributeSurplus(
  receiverId: string,
  amount: number,
  currency: string = 'USD'
): Promise<PayoutResponse> {
  const res = await fetch(`${API_URL}/impact/payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId, amount, currency }),
    cache: 'no-store',
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Payout failed');
  }
  return res.json();
}

// ---- Surplus Oracle ----

export type SurplusMetrics = {
  totalIncome: number;
  totalExpense: number;
  currentSurplus: number;
};

export type SurplusPrediction = {
  id: string;
  predicted_amount: number;
  period: string;
  reason: string;
  created_at: string;
};

export type SurplusResponse = {
  metrics: SurplusMetrics;
  prediction: SurplusPrediction | null;
};

export async function getSurplus(): Promise<SurplusResponse | null> {
  try {
    const res = await fetch(`${API_URL}/surplus/current`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as SurplusResponse;
  } catch {
    return null;
  }
}

export async function predictSurplus(predictedAmount: number, period: string, reason: string): Promise<SurplusPrediction | null> {
  try {
    const res = await fetch(`${API_URL}/surplus/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictedAmount, period, reason }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.prediction;
  } catch { return null; }
}

// ---- Reports ----

export type ReportGroupBy = 'day' | 'week' | 'month' | 'year';
export type ReportType = 'income' | 'expense' | 'all';

export type SummaryBucket = {
  period: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  isProjection: boolean;
  opening?: number;
  closing?: number;
  status?: 'actual' | 'projected' | 'mixed';
  actualCount?: number;
  projectionCount?: number;
};

export type ReportBucket = SummaryBucket;

export type SummaryResponse = {
  buckets: SummaryBucket[];
  totals: { income: number; expense: number; net: number };
};

export async function getReportSummary(params: {
  from: string;
  to: string;
  groupBy: ReportGroupBy;
  type: ReportType;
  includeProjections: boolean;
}): Promise<SummaryResponse | null> {
  const qs = new URLSearchParams({
    from: params.from,
    to: params.to,
    groupBy: params.groupBy,
    type: params.type,
    includeProjections: String(params.includeProjections),
  });
  try {
    const res = await fetch(`${API_URL}/reports/summary?${qs.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return (await res.json()) as SummaryResponse;
  } catch {
    return null;
  }
}

// ---- Goals ----

export type Goal = {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  monthly_saving: number;
  interest_rate: number;
  loan_term_months: number;
  start_date: string;
  duration_months: number;
  progress_percent: number;
  created_at: string;
};

export async function getGoals(): Promise<Goal[] | null> {
  try {
    const res = await fetch(`${API_URL}/goals`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { goals: Goal[] };
    return data.goals;
  } catch {
    return null;
  }
}

export async function getPredictions(): Promise<{ predictions: SurplusPrediction[] } | null> {
  try {
    const res = await fetch(`${API_URL}/surplus/predictions`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function updateSurplusPrediction(id: string, predictedAmount: number, period: string, reason: string): Promise<SurplusPrediction | null> {
  try {
    const res = await fetch(`${API_URL}/surplus/predict/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ predictedAmount, period, reason }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.prediction;
  } catch { return null; }
}

export async function deleteSurplusPrediction(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/surplus/predict/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch { return false; }
}


// ---- Impact (v2: verified / in_progress / history) ----

export type ImpactSurplusResponse = {
  verified: { period: string; closing_surplus: number };
  in_progress: { period: string; closing_surplus: number; status: 'open' | 'closed' };
  history: Array<{ period: string; closing_surplus: number; status: 'open' | 'closed' }>;
};

export async function getImpactSurplus(): Promise<ImpactSurplusResponse | null> {
  try {
    const res = await fetch(`${API_URL}/impact/surplus`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as ImpactSurplusResponse;
  } catch {
    return null;
  }
}

export type PayoutRecord = {
  id: string;
  transaction_id: string | null;
  amount: string;
  currency: string;
  receiver_email: string;
  status: 'pending' | 'success' | 'failed';
  paypal_batch_id: string | null;
  source_period: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getImpactPayouts(): Promise<PayoutRecord[] | null> {
  try {
    const res = await fetch(`${API_URL}/impact/payouts?limit=50`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { payouts?: PayoutRecord[] };
    return data.payouts ?? [];
  } catch {
    return null;
  }
}

export type HorizonCommitment = {
  nextMonth: string;
  total: number;
  breakdown: Array<{ name: string; monthly: number }>;
};

export async function getHorizonCommitment(): Promise<HorizonCommitment | null> {
  try {
    const res = await fetch(`${API_URL}/impact/horizon-commitment`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as HorizonCommitment;
  } catch {
    return null;
  }
}
