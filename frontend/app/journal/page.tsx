import Link from 'next/link';
import { BookOpen, Plus, AlertCircle } from 'lucide-react';
import { getTransactions } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Card from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

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
  transport: 'info',
  bills: 'danger',
  shopping: 'warning',
  health: 'danger',
  income: 'success',
  other: 'neutral',
};

export default async function Journal() {
  const transactions = await getTransactions(50);

  const totalIn = transactions
    ? transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0)
    : 0;
  const totalOut = transactions
    ? transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Journal"
        description="Every transaction parsed from natural-language input, with raw text preserved for audit."
        actions={
          <Link
            href="/journal/new"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            <Plus className="h-4 w-4" />
            New transaction
          </Link>
        }
      />

      {transactions === null ? (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-rose-500" />}
          title="Backend unreachable"
          description="Cannot load transactions. The backend may be starting up — Render free tier can take up to 50 seconds on first request. Refresh in a moment."
        />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No transactions yet"
          description={
            'Record your first transaction using natural language — try "saya jajan 20ribu" or "tadi dapat bonus 500rb".'
          }
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
                Visible transactions
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

          <Card className="overflow-hidden p-0">
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-surface-sunken text-left text-xs uppercase tracking-wider text-ink-faint">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income';
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
                          <Badge
                            variant={
                              CATEGORY_VARIANTS[tx.category] ?? 'neutral'
                            }
                          >
                            {tx.category}
                          </Badge>
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3.5 text-right font-mono font-medium tabular-nums ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '−'}{' '}
                          {usd.format(Number(tx.amount))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
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
                          <Badge
                            variant={
                              CATEGORY_VARIANTS[tx.category] ?? 'neutral'
                            }
                          >
                            {tx.category}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={`whitespace-nowrap font-mono text-sm font-medium tabular-nums ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '−'}{' '}
                        {usd.format(Number(tx.amount))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          <p className="mt-6 text-xs text-ink-faint">
            Showing {transactions.length} transaction
            {transactions.length === 1 ? '' : 's'} (newest first).
          </p>
        </>
      )}
    </div>
  );
}
