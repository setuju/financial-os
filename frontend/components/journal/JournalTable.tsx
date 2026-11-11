/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/journal/JournalTable.tsx
 * │  Purpose   : Component: JournalTable
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
import { Trash2, X, Check, AlertCircle, Loader2, Pencil } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Transaction } from '@/lib/api';
import EditTransactionDialog from './EditTransactionDialog';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dateFmt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
const CATEGORY_VARIANTS: Record<string, BadgeVariant> = {
  food: 'warning',
  groceries: 'success',
  transport: 'info',
  utilities: 'danger',
  bills: 'danger',
  shopping: 'warning',
  health: 'danger',
  fitness: 'success',
  subscription: 'info',
  entertainment: 'warning',
  education: 'neutral',
  travel: 'info',
  income: 'success',
  other: 'neutral',
};

const PAGE_SIZES = [20, 50, 100, 'all'] as const;
type PageSize = (typeof PAGE_SIZES)[number];

interface Props {
  transactions: Transaction[];
}

export default function JournalTable({ transactions }: Props) {
  const router = useRouter();
  const [pageSize, setPageSize] = useState<PageSize>(50);
  const [page, setPage] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const total = transactions.length;
  const effectiveSize = pageSize === 'all' ? Math.max(total, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / effectiveSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * effectiveSize;
  const end = Math.min(start + effectiveSize, total);
  const visible = transactions.slice(start, end);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/transactions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        setError(`Delete failed (${res.status}). Try again.`);
        return;
      }
      setConfirmId(null);
      router.refresh();
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        setError('Request timed out. Try again.');
      } else {
        setError('Network error. Check connection.');
      }
    } finally {
      setDeletingId(null);
    }
  }

  function changePageSize(s: PageSize) {
    setPageSize(s);
    setPage(0);
  }

  if (total === 0) return null;

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-surface-sunken text-left text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="w-16 px-2 py-3 font-medium">·</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((tx) => {
                const isIncome = tx.type === 'income';
                const isConfirming = confirmId === tx.id;
                const isDeleting = deletingId === tx.id;
                return (
                  <tr
                    key={tx.id}
                    className="transition-colors hover:bg-surface"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-ink-soft">
                      {dateFmt.format(new Date(tx.occurred_at))}
                    </td>
                    <td className="px-4 py-3.5 text-ink">{tx.raw_text}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={CATEGORY_VARIANTS[tx.category] ?? 'neutral'}>
                        {isIncome ? 'IN' : 'OUT'}:{tx.category}
                      </Badge>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3.5 text-right font-mono font-medium tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '−'} {usd.format(Number(tx.amount))}
                    </td>
                    <td className="px-2 py-3.5 text-right">
                      {isConfirming ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={isDeleting}
                            aria-label="Cancel delete"
                            className="rounded p-1 text-ink-faint hover:bg-surface-sunken"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tx.id)}
                            disabled={isDeleting}
                            aria-label="Confirm delete"
                            className="rounded p-1 text-danger hover:bg-danger-soft"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingTx(tx)}
                            aria-label="Edit transaction"
                            className="rounded p-1 text-ink-faint hover:bg-accent-soft hover:text-accent"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(tx.id)}
                            aria-label="Delete transaction"
                            className="rounded p-1 text-ink-faint hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-line md:hidden">
          {visible.map((tx) => {
            const isIncome = tx.type === 'income';
            const isConfirming = confirmId === tx.id;
            const isDeleting = deletingId === tx.id;
            return (
              <li key={tx.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {tx.raw_text}
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      {dateFmt.format(new Date(tx.occurred_at))}
                    </p>
                    <div className="mt-2">
                      <Badge variant={CATEGORY_VARIANTS[tx.category] ?? 'neutral'}>
                        {isIncome ? 'IN' : 'OUT'}:{tx.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`whitespace-nowrap font-mono text-sm font-medium tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '−'} {usd.format(Number(tx.amount))}
                    </div>
                    {isConfirming ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          disabled={isDeleting}
                          className="rounded p-1 text-ink-faint hover:bg-surface-sunken"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
                          disabled={isDeleting}
                          className="rounded p-1 text-danger hover:bg-danger-soft"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingTx(tx)}
                          aria-label="Edit transaction"
                          className="rounded p-1 text-ink-faint hover:bg-accent-soft hover:text-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(tx.id)}
                          aria-label="Delete transaction"
                          className="rounded p-1 text-ink-faint hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Footer: pagination + size selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-ink-faint">
          Showing <strong>{start + 1}-{end}</strong> of <strong>{total}</strong>{' '}
          transaction{total === 1 ? '' : 's'} (newest first)
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-ink-faint">Per page:</span>
            {PAGE_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changePageSize(s)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  pageSize === s
                    ? 'bg-accent text-white'
                    : 'border border-line bg-surface-raised text-ink-soft hover:bg-surface-sunken'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
                className="rounded border border-line bg-surface-raised px-2 py-1 text-xs font-medium text-ink-soft hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="px-2 text-xs text-ink-soft">
                Page {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage(Math.min(totalPages - 1, safePage + 1))
                }
                disabled={safePage >= totalPages - 1}
                className="rounded border border-line bg-surface-raised px-2 py-1 text-xs font-medium text-ink-soft hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
      {editingTx && (
        <EditTransactionDialog
          tx={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  );
}
