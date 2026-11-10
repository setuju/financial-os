/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/ledger/SummaryStats.tsx            │
 * │  Purpose   : Component: SummaryStats                                │
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

import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SummaryStats({ totals }: { totals: { income: number; expense: number; net: number } }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <StatCard label="Total income" value={usd.format(totals.income)} icon={<TrendingUp className="h-4 w-4" />} tone="success" />
      <StatCard label="Total expense" value={usd.format(totals.expense)} icon={<TrendingDown className="h-4 w-4" />} tone="danger" />
      <StatCard label="Net" value={usd.format(totals.net)} icon={<Sparkles className="h-4 w-4" />} tone={totals.net >= 0 ? 'success' : 'danger'} />
    </div>
  );
}
