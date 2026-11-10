/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/DistributeButton.tsx               │
 * │  Purpose   : Component: DistributeButton                            │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, CheckCircle2, Heart, Loader2 } from 'lucide-react';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const SUGGESTED_PERCENT = 0.1;

export type ImpactReceiverLite = {
  id: string;
  name: string;
  category: string;
  email: string;
};

type Phase = 'idle' | 'confirming' | 'loading' | 'success' | 'error';

type Props = {
  verifiedAmount: number;
  sourcePeriod: string;
  receivers: ImpactReceiverLite[];
};

type SuccessPayload = {
  batchId: string | null;
  receiverEmail: string;
  amount: number;
  sourcePeriod: string;
};

export default function DistributeButton({ verifiedAmount, sourcePeriod, receivers }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [receiverId, setReceiverId] = useState(receivers[0]?.id ?? '');
  const [amount, setAmount] = useState<string>(
    verifiedAmount > 0 ? (verifiedAmount * SUGGESTED_PERCENT).toFixed(2) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);

  const max = Math.max(0, verifiedAmount);
  const parsed = Number(amount);
  const validAmount = Number.isFinite(parsed) && parsed > 0 && parsed <= max + 0.001;
  const canProceed = validAmount && receiverId && max > 0;

  function beginConfirm() {
    if (!canProceed) return;
    setPhase('confirming');
  }

  async function confirm() {
    setPhase('loading');
    setError(null);
    try {
      const receiver = receivers.find((r) => r.id === receiverId);
      if (!receiver) {
        setPhase('error');
        setError('Receiver missing.');
        return;
      }
      const res = await fetch('/api/proxy/impact/payout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          amount: Number(parsed.toFixed(2)),
          currency: 'USD',
          sourcePeriod,
        }),
        signal: AbortSignal.timeout(65_000),
      });
      const data = (await res.json().catch(() => ({}))) as {
        payout?: { paypal_batch_id?: string | null };
        source_period?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setPhase('error');
        if (data.error === 'insufficient_surplus') {
          setError(
            data.message ||
              `Amount exceeds ${sourcePeriod} closing surplus (${usd.format(max)}).`,
          );
        } else if (data.error === 'paypal_payout_failed') {
          setError(data.message || 'PayPal payout failed. Try again.');
        } else if (data.error === 'invalid_receiver') {
          setError('Invalid receiver. Refresh and try again.');
        } else {
          setError(`Request failed (${res.status}).`);
        }
        return;
      }
      setSuccess({
        batchId: data.payout?.paypal_batch_id ?? null,
        receiverEmail: receiver.email,
        amount: parsed,
        sourcePeriod: data.source_period ?? sourcePeriod,
      });
      setPhase('success');
      router.refresh();
    } catch (e) {
      setPhase('error');
      if (e instanceof Error && e.name === 'TimeoutError') {
        setError('Request timed out. Backend may be waking — try again.');
      } else {
        setError('Network error. Check connection.');
      }
    }
  }

  function reset() {
    setPhase('idle');
    setSuccess(null);
    setError(null);
  }

  // Success state
  if (phase === 'success' && success) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-success/30 bg-success-soft p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
            <CheckCircle2 className="h-4 w-4" />
            Payout Successful
          </p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">Batch ID:</dt>
              <dd className="font-mono text-ink">{success.batchId || '—'}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">Receiver:</dt>
              <dd className="font-mono text-ink">{success.receiverEmail}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">Amount:</dt>
              <dd className="font-semibold text-ink">{usd.format(success.amount)} USD</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-ink-soft">From period:</dt>
              <dd className="font-mono text-ink">{success.sourcePeriod}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink-soft">
            Funds are being processed by PayPal Sandbox. No real money moved.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-line-strong bg-surface-raised px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
        >
          Distribute again
        </button>
      </div>
    );
  }

  // Idle / confirming / loading / error
  return (
    <div className="space-y-3">
      <div className="rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-soft">
        Source period: <strong>{sourcePeriod || 'n/a'}</strong> · Available:{' '}
        <strong>{usd.format(max)}</strong>
      </div>

      {max <= 0 && (
        <div className="flex items-start gap-1.5 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>No verified surplus available. Add transactions first.</span>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-soft">
          Receiver
        </label>
        <select
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          disabled={phase !== 'idle'}
          className="w-full rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        >
          {receivers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
          <span>Amount (USD)</span>
          <button
            type="button"
            disabled={phase !== 'idle' || max <= 0}
            onClick={() => setAmount((max * SUGGESTED_PERCENT).toFixed(2))}
            className="text-accent hover:underline disabled:opacity-40"
          >
            {SUGGESTED_PERCENT * 100}% suggestion
          </button>
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          max={max}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={phase !== 'idle'}
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
        />
        <p className="mt-1 text-xs text-ink-faint">
          Max: {usd.format(max)} · Suggested: {usd.format(max * SUGGESTED_PERCENT)}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {phase === 'confirming' && (
        <div className="rounded-lg border border-warning/30 bg-warning-soft p-3">
          <p className="flex items-start gap-1.5 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
            <span>
              Confirm payout of <strong>{usd.format(parsed)}</strong> to{' '}
              <strong>{receivers.find((r) => r.id === receiverId)?.name}</strong>{' '}
              from <strong>{sourcePeriod}</strong> surplus. Sandbox only.
            </span>
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="rounded-md border border-line-strong bg-surface-raised px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Heart className="h-4 w-4" />
              Confirm payout
            </button>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <button
          type="button"
          onClick={beginConfirm}
          disabled={!canProceed}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart className="h-4 w-4" />
          Distribute
        </button>
      )}

      {phase === 'loading' && (
        <div className="inline-flex items-center gap-2 rounded-md bg-surface-sunken px-4 py-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing PayPal payout…
        </div>
      )}
    </div>
  );
}
