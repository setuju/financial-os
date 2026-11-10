/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/impact/PayoutLog.tsx               │
 * │  Purpose   : Component: PayoutLog                                   │
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
import { Trash2, AlertCircle, Loader2, Heart, X } from 'lucide-react';
import type { PayoutRecord } from '@/lib/api';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function receiverShortName(email: string): string {
  // aidpulse-sandbox@example.com → AidPulse
  const prefix = email.split('@')[0] || email;
  const clean = prefix.replace(/-sandbox$/, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PayoutLog({ payouts }: { payouts: PayoutRecord[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/impact/payouts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        setError(`Delete failed (${res.status}).`);
        return;
      }
      setDeletingId(null);
      setConfirmText('');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-raised px-6 py-10 text-center">
        <Heart className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
        <p className="text-sm text-ink-soft">
          No donations yet. Distribute surplus above to start your impact log.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {payouts.map((p) => {
        const display = receiverShortName(p.receiver_email);
        const amt = Number(p.amount);
        const isDeleting = deletingId === p.id;
        const expected = `delete "${display} ${usd.format(amt)}"`;
        const matched = confirmText === expected;
        const isSuccess = p.status === 'success';
        return (
          <div
            key={p.id}
            className="rounded-lg border border-line bg-surface-raised p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-ink">{display}</span>
                  <span className="font-mono text-sm text-ink-soft">
                    {usd.format(amt)}
                  </span>
                  {isSuccess && (
                    <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success">
                      ✓ success
                    </span>
                  )}
                  {p.status === 'failed' && (
                    <span className="rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-medium text-danger">
                      ✗ failed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {fmtDate(p.created_at)} · from{' '}
                  {p.source_period ? p.source_period.slice(0, 7) : 'n/a'} · batch{' '}
                  {p.paypal_batch_id || '—'}
                </p>
              </div>
              {!isDeleting && (
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(p.id);
                    setConfirmText('');
                  }}
                  aria-label="Delete donation log entry"
                  className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {isDeleting && (
              <div className="mt-3 rounded-md border border-danger/30 bg-danger-soft p-3">
                <p className="text-xs font-medium text-danger">
                  ⚠️ Hide this log entry? Money already sent — surplus stays
                  reduced. Audit history kept for compliance.
                </p>
                <p className="mt-2 text-xs text-ink-soft">Type to confirm:</p>
                <input
                  autoFocus
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDeletingId(null);
                      setConfirmText('');
                    }
                  }}
                  placeholder={expected}
                  className="mt-1 w-full rounded-md border border-danger/40 bg-surface-raised px-2 py-1.5 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger"
                />
                <p className="mt-1 font-mono text-[10px] text-ink-faint">
                  expected: {expected}
                </p>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingId(null);
                      setConfirmText('');
                    }}
                    className="rounded-md border border-line-strong bg-surface-raised px-2 py-1 text-xs font-medium text-ink hover:bg-surface-sunken"
                  >
                    <X className="mr-1 inline h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!matched || busy}
                    onClick={() => handleDelete(p.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-danger px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                    Hide entry
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
