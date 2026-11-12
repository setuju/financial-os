/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/horizon/GoalsSection.tsx
 * │  Purpose   : Component: GoalsSection
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

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, AlertCircle, Loader2, Target, ShoppingBag } from 'lucide-react';
import ProductSearchDialog, { type C3Product } from './ProductSearchDialog';
import type { Goal } from '@/lib/api';

function monthYear(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function endDate(goal: Goal): string {
  try {
    const d = new Date(goal.start_date);
    if (Number.isNaN(d.getTime())) return '—';
    d.setMonth(d.getMonth() + Number(goal.duration_months || 0));
    return monthYear(d.toISOString());
  } catch {
    return '—';
  }
}

export default function GoalsSection({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    monthly_saving: '',
    interest_rate: '0',
    loan_term_months: '0',
    duration_months: '12',
  });

  // auto-compute duration from target / monthly_saving
  useEffect(() => {
    const t = Number(form.target_amount);
    const m = Number(form.monthly_saving);
    if (Number.isFinite(t) && Number.isFinite(m) && t > 0 && m > 0) {
      const computed = Math.ceil(t / m);
      if (String(computed) !== form.duration_months) {
        setForm((f) => ({ ...f, duration_months: String(computed) }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.target_amount, form.monthly_saving]);

  const handleProductSelect = (product: C3Product) => {
    const rawPrice = product.offers?.[0]?.price;
    const cleanPrice = rawPrice ? Number(String(rawPrice).replace(/[^0-9.]/g, '')) : 0;
    
    setForm((prev) => ({ 
      ...prev, 
      name: product.title, 
      target_amount: String(cleanPrice) 
    }));
    setIsProductDialogOpen(false);
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.target_amount) {
      setError('Name and target amount are required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/goals', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          targetAmount: Number(form.target_amount),
          monthlySaving: Number(form.monthly_saving || 0),
          interestRate: Number(form.interest_rate || 0),
          loanTermMonths: Number(form.loan_term_months || 0),
          startDate: new Date().toISOString().slice(0, 10),
          durationMonths: Number(form.duration_months || 12),
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        setError(`Add failed (${res.status}).`);
        return;
      }
      setShowAdd(false);
      setForm({
        name: '', target_amount: '', monthly_saving: '',
        interest_rate: '0', loan_term_months: '0', duration_months: '12',
      });
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/goals/${encodeURIComponent(id)}`, {
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

  function startDelete(id: string) {
    setDeletingId(id);
    setConfirmText('');
    setError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          Goals ({goals.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            setShowAdd((v) => !v);
            setError(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
        >
          {showAdd ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add goal
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isProductDialogOpen && <ProductSearchDialog onSelectProduct={handleProductSelect} onClose={() => setIsProductDialogOpen(false)} />}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-line bg-surface-raised p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Vacation fund"
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Target ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={form.target_amount}
                onChange={(e) =>
                  setForm({ ...form, target_amount: e.target.value })
                }
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Monthly saving ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.monthly_saving}
                onChange={(e) =>
                  setForm({ ...form, monthly_saving: e.target.value })
                }
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
                <span>Duration (months)</span>
                <span className="text-ink-faint">auto: {Math.ceil((Number(form.target_amount)||0) / (Number(form.monthly_saving)||1))}</span>
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={form.duration_months}
                onChange={(e) =>
                  setForm({ ...form, duration_months: e.target.value })
                }
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Interest rate (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.interest_rate}
                onChange={(e) =>
                  setForm({ ...form, interest_rate: e.target.value })
                }
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setError(null);
              }}
              className="rounded-md border border-line-strong bg-surface-raised px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save goal
            </button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface-raised px-6 py-10 text-center">
          <Target className="mx-auto mb-2 h-8 w-8 text-ink-faint" />
          <p className="text-sm text-ink-soft">
            No goals yet. Click <strong>Add goal</strong> to plan your first
            financial milestone.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => {
            const isDeleting = deletingId === goal.id;
            const expected = `delete "${goal.name}"`;
            const matched = confirmText === expected;
            return (
              <div
                key={goal.id}
                className="rounded-lg border border-line bg-surface-raised p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {goal.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      Target: ${Number(goal.target_amount).toLocaleString('en-US')} ·{' '}
                      ${Number(goal.monthly_saving).toLocaleString('en-US')}/mo ·{' '}
                      Ends {endDate(goal)}
                      <button onClick={() => setPurchaseModal(goal)} className="ml-2 inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-[10px] font-medium text-white hover:bg-accent-hover"><ShoppingBag className="h-3 w-3" /> Buy (Sandbox)</button>
                    </p>
                  </div>
                  {!isDeleting && (
                    <button
                      type="button"
                      onClick={() => startDelete(goal.id)}
                      aria-label={`Delete ${goal.name}`}
                      className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>Progress</span>
                    <span className="font-medium">
                      {goal.progress_percent}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, goal.progress_percent))}%`,
                      }}
                    />
                  </div>
                </div>

                {isDeleting && (
                  <div className="mt-4 rounded-md border border-danger/30 bg-danger-soft p-3">
                    <p className="text-xs font-medium text-danger">
                      ⚠️ Delete &ldquo;{goal.name}&rdquo;? Permanent. Cannot
                      undo.
                    </p>
                    <p className="mt-2 text-xs text-ink-soft">
                      Type to confirm:
                    </p>
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
                        className="rounded-md border border-line-strong bg-surface-raised px-2 py-1 text-xs font-medium text-ink transition-colors hover:bg-surface-sunken"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!matched || busy}
                        onClick={() => handleDelete(goal.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-danger px-2 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                        Delete permanently
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    
      {purchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-raised p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-accent" /> Sandbox Purchase
              </h2>
              <button onClick={() => setPurchaseModal(null)} className="text-ink-faint hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 rounded-lg bg-surface p-4 text-center">
              <p className="text-sm text-ink-soft">Item:</p>
              <p className="text-lg font-semibold text-ink">{purchaseModal.name}</p>
              <p className="mt-2 text-sm text-ink-soft">Total:</p>
              <p className="text-2xl font-bold text-accent">${purchaseModal.target_amount}</p>
            </div>
            <p className="mb-6 text-xs text-center text-ink-faint">
              This transaction is simulated via Channel3. No real money is moved.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPurchaseModal(null)} className="flex-1 rounded-lg border border-line-strong bg-surface-raised px-4 py-2 text-sm font-medium text-ink hover:bg-surface-sunken">
                Cancel
              </button>
              <button onClick={() => { alert("Purchase Successful via Channel3 Sandbox!"); setPurchaseModal(null); }} className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}