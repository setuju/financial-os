'use client';

import { useState } from 'react';
import {
  Loader2,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { distributeSurplus, type PayoutResponse, type ImpactReceiver } from '@/lib/api';

const MIN_PAYOUT_USD = 0.01;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type Phase = 'idle' | 'confirming' | 'loading' | 'success' | 'error';

export default function DistributeButton({
  currentSurplus,
  receivers,
}: {
  currentSurplus: number;
  receivers: ImpactReceiver[];
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<PayoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxContribution = Math.max(0, currentSurplus * 0.1);
  const [amountStr, setAmountStr] = useState(maxContribution.toFixed(2));
  const [receiverId, setReceiverId] = useState('');

  const amountNum = parseFloat(amountStr);
  const isValidAmount = !isNaN(amountNum) && amountNum >= MIN_PAYOUT_USD && amountNum <= maxContribution + 0.001;
  const selectedReceiver = receivers.find(r => r.id === receiverId);

  const isSurplusNegative = currentSurplus <= 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    const num = parseFloat(val);
    if (!isNaN(num) && num > maxContribution) {
      val = maxContribution.toFixed(2);
    }
    setAmountStr(val);
  };

  const handleConfirm = async () => {
    if (!isValidAmount || !selectedReceiver) return;
    setPhase('loading');
    setError(null);
    setResult(null);
    try {
      const res = await distributeSurplus(receiverId, amountNum);
      setResult(res);
      setPhase('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <h2 className="text-xl font-semibold text-ink">
          Ethical Surplus Distribution
        </h2>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-surface-sunken p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
          Verified Current Surplus
        </p>
        <p
          className={`font-mono text-2xl font-semibold tabular-nums ${
            isSurplusNegative ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {usd.format(currentSurplus)}
        </p>
      </div>

      {isSurplusNegative ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-warning-soft p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            You do not have a positive surplus to distribute. Record more income or
            reduce expenses in your Journal first.
          </p>
        </div>
      ) : phase === 'idle' ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Amount to distribute</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">$</span>
              <input
                type="number"
                min={MIN_PAYOUT_USD}
                max={maxContribution}
                step="0.01"
                value={amountStr}
                onChange={handleAmountChange}
                className="w-full rounded-lg border border-line-strong bg-surface-raised py-2 pl-7 pr-3 font-mono text-lg text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <p className="mt-1 text-xs text-ink-faint">
              Max: {usd.format(maxContribution)} (10% of your surplus)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Select vetted cause</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface-raised px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="" disabled>-- Select a cause --</option>
              {receivers.map(r => (
                <option key={r.id} value={r.id}>{r.name} — {r.category}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!isValidAmount || !selectedReceiver}
            onClick={() => setPhase('confirming')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Distribute {isValidAmount ? usd.format(amountNum) : '$0.00'}
            {selectedReceiver ? ` to ${selectedReceiver.name}` : ''}
          </button>
        </div>
      ) : phase === 'confirming' ? (
        <div className="rounded-lg border border-accent bg-accent-soft p-4">
          <p className="mb-3 text-sm text-ink">
            <ShieldCheck className="mr-1 inline h-4 w-4 text-accent" />
            <strong>Confirm distribution:</strong> Send {usd.format(amountNum)} to{' '}
            <strong>{selectedReceiver?.name}</strong> via PayPal Sandbox?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Yes, send payout
            </button>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="rounded-lg border border-line bg-surface-raised px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-sunken"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : phase === 'loading' ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-medium text-white opacity-70"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing PayPal payout…
        </button>
      ) : phase === 'success' && result ? (
        <div className="rounded-lg border border-emerald-200 bg-success-soft p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">Payout Successful</h3>
          </div>
          <dl className="space-y-1 text-sm text-emerald-800">
            <div className="flex gap-2">
              <dt className="w-24 text-emerald-700">Batch ID:</dt>
              <dd className="font-mono text-xs">{result.payout.paypal_batch_id}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-emerald-700">Receiver:</dt>
              <dd className="font-mono text-xs">{result.payout.receiver_email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-emerald-700">Amount:</dt>
              <dd className="font-mono text-xs">${result.payout.amount} USD</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-emerald-700">
            Funds are being processed by PayPal Sandbox. No real money moved.
          </p>
        </div>
      ) : phase === 'error' ? (
        <div className="rounded-lg border border-rose-200 bg-danger-soft p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-rose-900">Payout failed</h3>
          </div>
          <p className="text-sm text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="mt-3 rounded-lg border border-rose-300 bg-surface-raised px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
