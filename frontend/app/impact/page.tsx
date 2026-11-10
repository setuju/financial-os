/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/impact/page.tsx
 * │  Purpose   : Page: /impact/page.tsx
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

import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle2, TrendingUp, Heart } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DistributeButton from '@/components/DistributeButton';
import PayoutLog from '@/components/impact/PayoutLog';
import { serverGetImpactSurplus as getImpactSurplus, serverGetImpactPayouts as getImpactPayouts, serverGetImpactReceivers as getImpactReceivers, serverGetHorizonCommitment as getHorizonCommitment } from '@/lib/api-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function monthLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function ImpactWallet() {
  const [surplus, receivers, payouts, horizon] = await Promise.all([
    getImpactSurplus(),
    getImpactReceivers(),
    getImpactPayouts(),
    getHorizonCommitment(),
  ]);

  const verified = surplus?.verified.closing_surplus ?? 0;
  const inProgress = surplus?.in_progress.closing_surplus ?? 0;
  const history = surplus?.history ?? [];
  const receiverList = receivers?.receivers ?? [];
  const payoutList = payouts ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Impact Wallet"
        description="Distribute verified surplus from last month to vetted causes via PayPal Payouts."
      />

      <div className="mb-4 flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </div>

      {/* Surplus cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-success/30 bg-success-soft/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Verified Surplus
            </span>
            <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-medium text-success">
              ✓ closed
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">
            {surplus ? monthLabel(surplus.verified.period) : '—'}
          </p>
          <p className="mt-2 text-3xl font-semibold text-success">
            {usd.format(verified)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Available for distribution
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            inProgress < 0
              ? 'border-danger/30 bg-danger-soft/40'
              : 'border-line bg-surface-raised'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              In Progress
            </span>
            <span className="rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
              ⏳ open
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">
            {surplus ? monthLabel(surplus.in_progress.period) : '—'}
          </p>
          <p
            className={`mt-2 text-3xl font-semibold ${
              inProgress < 0 ? 'text-danger' : 'text-ink'
            }`}
          >
            {usd.format(inProgress)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {inProgress < 0
              ? 'Under water until month end'
              : 'Projected to close positive'}
          </p>
        </div>
      </div>

      {/* History strip */}
      {history.length > 0 && (
        <div className="mb-6 rounded-lg border border-line bg-surface-raised p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
            <TrendingUp className="h-3.5 w-3.5" />
            Surplus History
          </p>
          <div className="flex flex-wrap gap-3">
            {history.map((h) => (
              <div
                key={h.period}
                className="rounded-md border border-line bg-surface px-3 py-2 text-center"
              >
                <p className="text-[10px] uppercase text-ink-faint">
                  {monthLabel(h.period)}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    h.closing_surplus >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {usd.format(h.closing_surplus)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horizon commitment warning */}
      {horizon && horizon.total > 0 && (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning-soft/60 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Next month ({monthLabel(horizon.nextMonth)}):{' '}
                {usd.format(horizon.total)} in Horizon bills
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-ink-soft">
                {horizon.breakdown.map((b) => (
                  <li key={b.name} className="flex justify-between gap-2">
                    <span className="truncate">• {b.name}</span>
                    <span className="font-mono">{usd.format(b.monthly)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-ink-faint">
                Distribute only if your verified surplus covers both donation
                and next month&apos;s commitments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distribution card */}
      <div className="mb-6 rounded-lg border border-line bg-surface-raised p-5">
        <div className="mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4 text-danger" />
          <h2 className="text-sm font-semibold text-ink">
            Ethical Surplus Distribution
          </h2>
        </div>
        <DistributeButton
          verifiedAmount={verified}
          sourcePeriod={surplus?.verified.period ?? ''}
          receivers={receiverList}
        />
      </div>

      {/* Donation log */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Donation Log ({payoutList.length})
          </h2>
        </div>
        <PayoutLog payouts={payoutList} />
      </div>

      <div className="mt-6 rounded-lg border border-accent/20 bg-accent-soft/40 p-3 text-xs text-ink-soft">
        <p>
          <strong>Note:</strong> This transaction is processed via PayPal
          Sandbox. No real money is moved. Hiding a log entry does not refund
          — the audit trail is preserved for compliance.
        </p>
      </div>
    </div>
  );
}
