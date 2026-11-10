/**
 * Server-only API helpers — session-aware.
 * Client components MUST use `lib/api.ts` (proxy) instead.
 * Import from server components / server actions only.
 */
import { cookies } from 'next/headers';
import type {
  Transaction,
  TransactionsResponse,
  CreateTransactionResult,
  SurplusResponse,
  SurplusPrediction,
  Goal,
  SummaryResponse,
  ReportGroupBy,
  ReportType,
  ImpactSurplusResponse,
  PayoutRecord,
  ImpactReceiver,
  HorizonCommitment,
} from './api';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

function sessionId(): string | null {
  try {
    return cookies().get('fos_session_id')?.value ?? null;
  } catch {
    return null;
  }
}

function withSession(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const sid = sessionId();
  if (sid) headers.set('x-session-id', sid);
  return { ...init, headers, cache: 'no-store' };
}

export async function serverGetTransactions(limit = 50): Promise<Transaction[] | null> {
  try {
    const res = await fetch(
      `${API_URL}/transactions?limit=${limit}`,
      withSession({ signal: AbortSignal.timeout(5000) }),
    );
    if (!res.ok) return null;
    return ((await res.json()) as TransactionsResponse).transactions;
  } catch {
    return null;
  }
}

export async function serverCreateTransaction(text: string): Promise<CreateTransactionResult> {
  try {
    const res = await fetch(
      `${API_URL}/transactions`,
      withSession({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10000),
      }),
    );
    if (res.status === 201) {
      return {
        ok: true,
        transaction: ((await res.json()) as { transaction: Transaction }).transaction,
      };
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

export async function serverGetSurplus(): Promise<SurplusResponse | null> {
  try {
    const res = await fetch(
      `${API_URL}/surplus/current`,
      withSession({ signal: AbortSignal.timeout(5000) }),
    );
    if (!res.ok) return null;
    return (await res.json()) as SurplusResponse;
  } catch {
    return null;
  }
}

export async function serverGetGoals(): Promise<Goal[] | null> {
  try {
    const res = await fetch(
      `${API_URL}/goals`,
      withSession({ signal: AbortSignal.timeout(10000) }),
    );
    if (!res.ok) return null;
    return ((await res.json()) as { goals: Goal[] }).goals;
  } catch {
    return null;
  }
}

export async function serverGetPredictions(): Promise<{ predictions: SurplusPrediction[] } | null> {
  try {
    const res = await fetch(
      `${API_URL}/surplus/predictions`,
      withSession({ signal: AbortSignal.timeout(5000) }),
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function serverGetImpactSurplus(): Promise<ImpactSurplusResponse | null> {
  try {
    const res = await fetch(
      `${API_URL}/impact/surplus`,
      withSession({ signal: AbortSignal.timeout(10_000) }),
    );
    if (!res.ok) return null;
    return (await res.json()) as ImpactSurplusResponse;
  } catch {
    return null;
  }
}

export async function serverGetImpactPayouts(): Promise<PayoutRecord[] | null> {
  try {
    const res = await fetch(
      `${API_URL}/impact/payouts?limit=50`,
      withSession({ signal: AbortSignal.timeout(10_000) }),
    );
    if (!res.ok) return null;
    return ((await res.json()) as { payouts?: PayoutRecord[] }).payouts ?? [];
  } catch {
    return null;
  }
}

export async function serverGetImpactReceivers(): Promise<{ receivers: ImpactReceiver[] } | null> {
  try {
    const res = await fetch(
      `${API_URL}/impact/receivers`,
      withSession({ signal: AbortSignal.timeout(5000) }),
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function serverGetHorizonCommitment(): Promise<HorizonCommitment | null> {
  try {
    const res = await fetch(
      `${API_URL}/impact/horizon-commitment`,
      withSession({ signal: AbortSignal.timeout(10_000) }),
    );
    if (!res.ok) return null;
    return (await res.json()) as HorizonCommitment;
  } catch {
    return null;
  }
}

export async function serverGetReportSummary(params: {
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
    const res = await fetch(
      `${API_URL}/reports/summary?${qs.toString()}`,
      withSession({ signal: AbortSignal.timeout(20000) }),
    );
    if (!res.ok) return null;
    return (await res.json()) as SummaryResponse;
  } catch {
    return null;
  }
}
