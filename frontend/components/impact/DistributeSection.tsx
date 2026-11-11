'use client';

import { useState } from 'react';
import { Heart, Mail, Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface Receiver {
  id: string;
  name: string;
  category: string;
  email: string;
}

interface Props {
  receivers: Receiver[];
  verifiedSurplus: number;
  sourcePeriod: string;
}

export default function DistributeSection({ receivers, verifiedSurplus, sourcePeriod }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ batchId: string; amount: string; email: string } | null>(null);

  const isCustom = customEmail.trim().length > 0;
  const effectiveId = isCustom ? customEmail.trim() : selectedId;

  const handleDistribute = async () => {
    if (!effectiveId) return setError('Please select a cause or enter a valid email.');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Enter a valid amount.');

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/proxy/impact/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: effectiveId,
          amount: Number(amount),
          sourcePeriod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Payout failed');

      setSuccess({
        batchId: data.paypalResponse?.batchHeader?.payoutBatchId || 'N/A',
        amount: `$${Number(amount).toFixed(2)}`,
        email: isCustom ? customEmail : receivers.find(r => r.id === selectedId)?.email || 'Unknown',
      });
      setAmount('');
      setCustomEmail('');
      setSelectedId(null);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Network error. Is the email registered in PayPal Sandbox?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface-raised p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-rose-500" />
        <h2 className="text-lg font-semibold text-ink">Ethical Surplus Distribution</h2>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg bg-surface px-4 py-2 text-sm text-ink-soft">
        <span>Source period: <strong className="text-ink">{sourcePeriod}</strong></span>
        <span>Available: <strong className="text-emerald-600">${verifiedSurplus.toFixed(2)}</strong></span>
      </div>

      {success ? (
        <div className="mb-4 rounded-lg border border-success/30 bg-success-soft p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="h-5 w-5" />
            Sandbox Payout Successful!
          </div>
          <p className="mt-2 text-ink-soft">Batch ID: <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">{success.batchId}</code></p>
          <p className="text-ink-soft">Amount: {success.amount} → {success.email}</p>
          <button onClick={() => setSuccess(null)} className="mt-3 text-xs font-medium text-accent hover:underline">Make another distribution</button>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {receivers.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedId(r.id); setCustomEmail(''); }}
                className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                  selectedId === r.id && !isCustom
                    ? 'border-accent bg-accent-soft/30 ring-1 ring-accent'
                    : 'border-line bg-surface hover:border-accent/50'
                }`}
              >
                <span className="text-xs font-semibold text-ink">{r.name}</span>
                <span className="mt-0.5 text-[10px] uppercase tracking-wide text-ink-soft">{r.category}</span>
              </button>
            ))}
          </div>

          <div className="mb-4 border-t border-line pt-4">
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Or send directly to a verified PayPal email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="email"
                value={customEmail}
                onChange={(e) => { setCustomEmail(e.target.value); setSelectedId(null); }}
                placeholder="organization@example.com"
                className="w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            {isCustom && (
              <p className="mt-1 text-[10px] text-ink-faint">
                This email will be verified against PayPal Sandbox when you click Distribute.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-ink-soft">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-ink-faint">Suggested: ${(verifiedSurplus * 0.1).toFixed(2)} (10%)</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleDistribute}
            disabled={loading || !effectiveId || !amount}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Sending via PayPal Sandbox...' : 'Distribute'}
          </button>
        </>
      )}
    </div>
  );
}
