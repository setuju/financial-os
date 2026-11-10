/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/journal/EditTransactionDialog.tsx
 * │  Purpose   : Component: EditTransactionDialog
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Transaction } from '@/lib/api';

export default function EditTransactionDialog({
  tx,
  onClose,
}: {
  tx: Transaction;
  onClose: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState(tx.raw_text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = text.trim() !== tx.raw_text.trim();

  async function save() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/proxy/transactions/${encodeURIComponent(tx.id)}`,
        {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ raw_text: text.trim() }),
          signal: AbortSignal.timeout(15_000),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        if (data.error === 'no_amount') {
          setError(
            'No amount detected. Try "spent 20 on coffee" or "paid 15 for lunch".',
          );
        } else if (data.error === 'planned_input') {
          setError(
            'This looks like a plan, not a completed transaction. Rephrase as past tense.',
          );
        } else if (data.error === 'negated_input') {
          setError('This looks like a cancellation. Cannot save as a transaction.');
        } else if (data.error === 'zero_amount') {
          setError('Amount cannot be zero.');
        } else {
          setError(`Update failed (${res.status}).`);
        }
        return;
      }
      onClose();
      router.refresh();
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        setError('Request timed out. Try again.');
      } else {
        setError('Network error. Check connection.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-surface-raised p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Edit transaction</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-ink-faint hover:bg-surface-sunken"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-soft">
          <span className="font-medium">Current:</span> {tx.raw_text}
          <br />
          <span className="font-medium">Parsed:</span> {tx.type} · $
          {Number(tx.amount).toFixed(2)} · {tx.category}
        </div>

        <label className="mb-1 block text-xs font-medium text-ink-soft">
          Raw text (re-parsed on save)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          autoFocus
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-ink-faint">
          Amount, type, and category are re-parsed from this text.
        </p>

        {error && (
          <div className="mt-3 flex items-start gap-1.5 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line-strong bg-surface-raised px-3 py-1.5 text-sm text-ink hover:bg-surface-sunken"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
