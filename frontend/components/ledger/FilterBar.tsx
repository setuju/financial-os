/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/ledger/FilterBar.tsx
 * │  Purpose   : Component: FilterBar
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

import { LayoutGrid, Eye, EyeOff } from 'lucide-react';
import type { ReportGroupBy, ReportType } from '@/lib/api';

export type ViewMode = 'grid' | 'notebook';
export type DatePreset = '7d' | '30d' | 'this-month' | 'last-month' | 'this-year' | 'all-time' | 'custom';

interface Props {
  view: ViewMode; setView: (v: ViewMode) => void;
  type: ReportType; setType: (t: ReportType) => void;
  groupBy: ReportGroupBy; setGroupBy: (g: ReportGroupBy) => void;
  preset: DatePreset; setPreset: (p: DatePreset) => void;
  customFrom: string; setCustomFrom: (s: string) => void;
  customTo: string; setCustomTo: (s: string) => void;
  includeProjections: boolean; setIncludeProjections: (b: boolean) => void;
}

function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === o.value ? 'bg-accent text-white shadow-sm' : 'text-ink-soft hover:bg-surface-sunken'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar(props: Props) {
  const { view, setView, type, setType, groupBy, setGroupBy, preset, setPreset, customFrom, setCustomFrom, customTo, setCustomTo, includeProjections, setIncludeProjections } = props;

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-line bg-surface-raised p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-ink-faint" />
          <Segmented<ViewMode>
            value={view}
            onChange={setView}
            options={[{ value: 'grid', label: 'Grid' }, { value: 'notebook', label: 'Notebook' }]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">Type:</span>
          <Segmented<ReportType>
            value={type}
            onChange={setType}
            options={[{ value: 'all', label: 'All' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">Group:</span>
          <Segmented<ReportGroupBy>
            value={groupBy}
            onChange={setGroupBy}
            options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-faint">Range:</span>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as DatePreset)}
            className="rounded-md border border-line-strong bg-surface-raised px-2 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-year">This year</option>
            <option value="all-time">All time</option>
            <option value="custom">Custom…</option>
          </select>
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="rounded-md border border-line-strong bg-surface-raised px-2 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
            <span className="text-xs text-ink-faint">to</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="rounded-md border border-line-strong bg-surface-raised px-2 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIncludeProjections(!includeProjections)}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${includeProjections ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-soft hover:bg-surface-sunken'}`}
        >
          {includeProjections ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {includeProjections ? 'Projections on' : 'Projections off'}
        </button>
      </div>
    </div>
  );
}
