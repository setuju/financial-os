/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/ledger/LedgerGrid.tsx
 * │  Purpose   : Component: LedgerGrid
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

import { Info } from 'lucide-react';
import type { SummaryBucket as ReportBucket } from '@/lib/api';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

type GroupBy = 'day' | 'week' | 'month' | 'year';

interface Props {
  buckets: ReportBucket[];
  groupBy: GroupBy;
  showBalances: boolean;
  onDeleteTransaction?: (id: string) => Promise<void>;
}

function fmtPeriod(iso: string, groupBy: GroupBy): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (groupBy === 'year') return String(d.getUTCFullYear());
  if (groupBy === 'month') {
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  // day + week
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function LedgerGrid({ buckets, groupBy, showBalances }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong bg-surface-raised px-6 py-12 text-center text-sm text-ink-soft">
        No transactions in this range. Try a wider range or toggle Projections.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-raised">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-surface-sunken">
          <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-3 py-2 font-medium">Period</th>
            <th className="px-3 py-2 text-right font-medium">Income</th>
            <th className="px-3 py-2 text-right font-medium">Expense</th>
            <th className="px-3 py-2 text-right font-medium">Net</th>
            {showBalances && (
              <>
                <th className="px-3 py-2 text-right font-medium">Opening</th>
                <th className="px-3 py-2 text-right font-medium">Closing</th>
              </>
            )}
            <th className="px-3 py-2 text-center font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => {
            const effectiveStatus = b.status ?? (b.isProjection ? 'projected' : 'actual');
            const statusColor =
              effectiveStatus === 'actual'
                ? 'bg-success-soft text-success'
                : effectiveStatus === 'projected'
                  ? 'bg-warning-soft text-warning'
                  : 'bg-accent-soft text-accent';
            const statusLabel =
              effectiveStatus === 'actual'
                ? 'ACTUAL'
                : effectiveStatus === 'projected'
                  ? 'PROJECTED'
                  : 'MIXED';
            return (
              <tr
                key={b.period}
                className="border-b border-line last:border-b-0 hover:bg-surface-sunken/40"
              >
                <td className="px-3 py-2 font-medium text-ink">
                  {fmtPeriod(b.period, groupBy)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-success">
                  {b.income > 0 ? usd.format(b.income) : <span className="text-ink-faint">—</span>}
                </td>
                <td className="px-3 py-2 text-right font-mono text-danger">
                  {b.expense > 0 ? usd.format(b.expense) : <span className="text-ink-faint">—</span>}
                </td>
                <td
                  className={`px-3 py-2 text-right font-mono font-semibold ${
                    b.net >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {b.net >= 0 ? '+' : ''}
                  {usd.format(b.net)}
                </td>
                {showBalances && (
                  <>
                    <td className="px-3 py-2 text-right font-mono text-ink-soft">
                      {usdCompact.format(b.opening ?? 0)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-ink">
                      {usdCompact.format(b.closing ?? 0)}
                    </td>
                  </>
                )}
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColor}`}
                    title={`${b.actualCount} actual · ${b.projectionCount} projected`}
                  >
                    {statusLabel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StatusLegend({ buckets }: { buckets: ReportBucket[] }) {
  const effectiveStatus = (b: ReportBucket): 'actual' | 'projected' | 'mixed' =>
    b.status ?? (b.isProjection ? 'projected' : 'actual');
  const hasProjected = buckets.some((b) => {
    const s = effectiveStatus(b);
    return s === 'projected' || s === 'mixed';
  });
  const hasMixed = buckets.some((b) => effectiveStatus(b) === 'mixed');

  return (
    <div className="mt-3 space-y-1 text-xs text-ink-faint">
      <p className="flex items-start gap-1.5">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          <strong className="text-success">ACTUAL</strong> = recorded transactions ·{' '}
          <strong className="text-warning">PROJECTED</strong> = forecast (is_projection=true) ·{' '}
          <strong className="text-accent">MIXED</strong> = both in period
        </span>
      </p>
      {!hasProjected && !hasMixed && (
        <p className="pl-5">
          All {buckets.length} period{buckets.length !== 1 ? 's' : ''} in this range are{' '}
          <strong>ACTUAL</strong>. Toggle <strong>Projections ON</strong> and try a wider range
          to see forecasts.
        </p>
      )}
    </div>
  );
}
