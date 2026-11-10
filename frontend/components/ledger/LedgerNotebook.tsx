/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/ledger/LedgerNotebook.tsx
 * │  Purpose   : Component: LedgerNotebook
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

import type { SummaryBucket } from '@/lib/api';
import Card from '@/components/ui/Card';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LedgerNotebook({ buckets }: { buckets: SummaryBucket[] }) {
  return (
    <Card className="p-0">
      <ul className="divide-y divide-line">
        {buckets.map((b) => (
          <li key={b.label} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium text-ink">{b.label}</p>
                {b.isProjection && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">Projected</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                {b.income > 0 && (<span>Income <span className="font-mono text-emerald-600">{usd.format(b.income)}</span></span>)}
                {b.expense > 0 && (<span>Expense <span className="font-mono text-rose-600">{usd.format(b.expense)}</span></span>)}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-mono text-base font-semibold tabular-nums ${b.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {b.net >= 0 ? '+' : ''}{usd.format(b.net)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Net</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
