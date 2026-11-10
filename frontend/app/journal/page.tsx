/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/app/journal/page.tsx                          │
 * │  Purpose   : Page: /journal/page.tsx                                │
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

import Link from 'next/link';
import { BookOpen, Plus, AlertCircle } from 'lucide-react';
import { getTransactions } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';
import ExportPdfButton from '@/components/journal/ExportPdfButton';
import JournalTable from '@/components/journal/JournalTable';

export const dynamic = 'force-dynamic';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function Journal() {
  // Fetch up to 500 — far more than seed (109), enough for demo.
  // Backend may cap internally; if so, we paginate what we have.
  const allTx = await getTransactions(500);
  const now = new Date();
  const transactions = (allTx ?? []).filter(
    (t) =>
      !(t as unknown as { is_projection?: boolean }).is_projection &&
      new Date(t.occurred_at) <= now,
  );

  const totalIn = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Journal"
        description="Every transaction parsed from natural-language input, with raw text preserved for audit."
        actions={
          <>
            <ExportPdfButton transactions={transactions} />
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <Plus className="h-4 w-4" />
              New transaction
            </Link>
          </>
        }
      />

      {allTx === null ? (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-rose-500" />}
          title="Backend unreachable"
          description="Cannot load transactions. The backend may be starting up — Render free tier can take up to 50 seconds on first request. Refresh in a moment."
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No transactions yet"
          description='Record your first transaction using natural language — try "saya jajan 20ribu" or "tadi dapat bonus 500rb".'
          action={
            <Link
              href="/journal/new"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Record your first transaction
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Total transactions
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-ink">
                {transactions.length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Total in
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-emerald-600">
                {usd.format(totalIn)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                Total out
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-rose-600">
                {usd.format(totalOut)}
              </p>
            </Card>
          </div>

          <JournalTable transactions={transactions} />
        </>
      )}
    </div>
  );
}
