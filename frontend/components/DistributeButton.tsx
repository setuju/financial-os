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
import { distributeSurplus, type PayoutResponse } from '@/lib/api';

const IDR_PER_USD = 15000;
const MIN_PAYOUT_USD = 0.01;
const SURPLUS_PERCENTAGE = 0.1;
const SANDBOX_EMAIL = 'sb-wyxsu53660889@personal.example.com';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

type Phase = 'idle' | 'confirming' | 'loading' | 'success' | 'error';

export default function DistributeButton({ currentSurplus }: { currentSurplus: number }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<PayoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contributionIDR = Math.max(0, currentSurplus * SURPLUS_PERCENTAGE);
  const amountUSD = Math.max(
    MIN_PAYOUT_USD,
    Math.round((contributionIDR / IDR_PER_USD) * 100) / 100,
  );
  const isSurplusNegative = currentSurplus <= 0;

  const handleConfirm = async () => {
    setPhase('loading');
    setError(null);
    setResult(null);
    try {
      const res = await distributeSurplus(SANDBOX_EMAIL, amountUSD);
      setResult(res);
      setPhase('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <h2 className="text-xl font-semibold text-zinc-900">
          Ethical Surplus Distribution
        </h2>
      </div>

      <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Verified Current Surplus
        </p>
        <p
          className={`font-mono text-2xl font-semibold tabular-nums ${
            isSurplusNegative ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {rupiahFormatter.format(currentSurplus)}
        </p>
      </div>

      {isSurplusNegative ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            You do not have a positive surplus to distribute. Record more income or
            reduce expenses in your Journal first.
          </p>
        </div>
      ) : phase === 'idle' ? (
        <>
          <p className="mb-4 text-sm text-zinc-600">
            We&apos;ll distribute{' '}
            <strong className="font-mono text-zinc-900">
              {rupiahFormatter.format(contributionIDR)}
            </strong>{' '}
            (≈{' '}
            <strong className="font-mono text-zinc-900">
              ${amountUSD.toFixed(2)} USD
            </strong>{' '}
            — 10% of your surplus) to a verified impact receiver via PayPal.
          </p>
          <button
            type="button"
            onClick={() => setPhase('confirming')}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070ba] px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-[#005ea6]"
          >
            <Send className="h-4 w-4" />
            Distribute ${amountUSD.toFixed(2)} USD
          </button>
        </>
      ) : phase === 'confirming' ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-3 text-sm text-blue-900">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            <strong>Confirm distribution:</strong> Send ${amountUSD.toFixed(2)} USD to{' '}
            <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs">
              {SANDBOX_EMAIL}
            </code>
            ?
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
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : phase === 'loading' ? (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070ba] px-4 py-3 font-medium text-white opacity-70"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing PayPal payout…
        </button>
      ) : phase === 'success' && result ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
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
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <h3 className="font-semibold text-rose-900">Payout failed</h3>
          </div>
          <p className="text-sm text-rose-800">{error}</p>
          <button
            type="button"
            onClick={() => setPhase('idle')}
            className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
          >
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
