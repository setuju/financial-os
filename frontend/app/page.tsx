/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/app/page.tsx                                  │
 * │  Purpose   : Page: /page.tsx                                        │
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
import {
  BookOpen,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { getSurplus } from '@/lib/api';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function Home() {
  const surplusData = await getSurplus();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Financial OS
        </h1>
        <p className="mt-2 max-w-2xl text-base text-ink-soft">
          Track money with words. Allocate ethical surplus via PayPal Payouts.
        </p>
      </div>

      {!surplusData ? (
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="Connecting to backend"
          description="The Financial OS backend may be starting up — Render free tier can take up to 50 seconds on first request. Refresh in a moment."
        />
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total income"
              value={usd.format(surplusData.metrics.totalIncome)}
              icon={<TrendingUp className="h-4 w-4" />}
              tone="success"
            />
            <StatCard
              label="Total expense"
              value={usd.format(surplusData.metrics.totalExpense)}
              icon={<TrendingDown className="h-4 w-4" />}
              tone="danger"
            />
            <StatCard
              label="Current surplus"
              value={usd.format(surplusData.metrics.currentSurplus)}
              icon={<Sparkles className="h-4 w-4" />}
              tone={surplusData.metrics.currentSurplus >= 0 ? 'success' : 'danger'}
            />
          </div>

          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-ink">Explore</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/journal"
                className="group rounded-xl border border-line bg-surface-raised p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
              >
                <BookOpen className="mb-3 h-6 w-6 text-accent" />
                <h3 className="text-base font-semibold text-ink group-hover:text-accent">
                  Journal
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Every transaction parsed from natural language, with raw text preserved for audit.
                </p>
              </Link>
              <Link
                href="/impact"
                className="group rounded-xl border border-line bg-surface-raised p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
              >
                <Heart className="mb-3 h-6 w-6 text-rose-500" />
                <h3 className="text-base font-semibold text-ink group-hover:text-accent">
                  Impact Wallet
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Distribute 10% of your verified ethical surplus via PayPal Payouts sandbox.
                </p>
              </Link>
              <Link
                href="/horizon"
                className="group rounded-xl border border-line bg-surface-raised p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
              >
                <Target className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="text-base font-semibold text-ink group-hover:text-accent">
                  Financial Horizon
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Visualize long-term goals with target amounts, monthly savings, and interest rates.
                </p>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-ink-faint">
            Powered by PayPal Payouts · Elasticsearch · Bryntum Gantt
          </p>
        </>
      )}
    </div>
  );
}
