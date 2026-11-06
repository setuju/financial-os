'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Spinner from '@/components/ui/Spinner';
import {
  getReportSummary,
  type SummaryResponse,
  type ReportGroupBy,
  type ReportType,
} from '@/lib/api';
import FilterBar, { type ViewMode, type DatePreset } from './FilterBar';
import LedgerGrid from './LedgerGrid';
import LedgerNotebook from './LedgerNotebook';
import SummaryStats from './SummaryStats';

function computeRange(preset: DatePreset, customFrom: string, customTo: string): { from: string; to: string } {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const todayStr = fmt(today);
  switch (preset) {
    case '7d': { const d = new Date(today); d.setUTCDate(d.getUTCDate() - 7); return { from: fmt(d), to: todayStr }; }
    case '30d': { const d = new Date(today); d.setUTCDate(d.getUTCDate() - 30); return { from: fmt(d), to: todayStr }; }
    case 'this-month': { const d = new Date(today); d.setUTCDate(1); return { from: fmt(d), to: todayStr }; }
    case 'last-month': { const first = new Date(today); first.setUTCDate(1); first.setUTCMonth(first.getUTCMonth() - 1); const last = new Date(today); last.setUTCDate(0); return { from: fmt(first), to: fmt(last) }; }
    case 'this-year': { const d = new Date(today); d.setUTCMonth(0); d.setUTCDate(1); return { from: fmt(d), to: todayStr }; }
    case 'all-time': return { from: '2000-01-01', to: todayStr };
    case 'custom': return { from: customFrom || todayStr, to: customTo || todayStr };
  }
}

export default function LedgerClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [view, setView] = useState<ViewMode>((sp.get('view') as ViewMode) || 'grid');
  const [type, setType] = useState<ReportType>((sp.get('type') as ReportType) || 'all');
  const [groupBy, setGroupBy] = useState<ReportGroupBy>((sp.get('groupBy') as ReportGroupBy) || 'day');
  const [preset, setPreset] = useState<DatePreset>((sp.get('preset') as DatePreset) || '30d');
  const [customFrom, setCustomFrom] = useState(sp.get('from') || '');
  const [customTo, setCustomTo] = useState(sp.get('to') || '');
  const [includeProjections, setIncludeProjections] = useState(sp.get('proj') !== '0');

  const range = useMemo(() => computeRange(preset, customFrom, customTo), [preset, customFrom, customTo]);

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('type', type);
    params.set('groupBy', groupBy);
    params.set('preset', preset);
    if (preset === 'custom') { params.set('from', range.from); params.set('to', range.to); }
    params.set('proj', includeProjections ? '1' : '0');
    router.replace(`/ledger?${params.toString()}`, { scroll: false });
  }, [view, type, groupBy, preset, range.from, range.to, includeProjections, router]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getReportSummary({ from: range.from, to: range.to, groupBy, type, includeProjections })
      .then((res) => {
        if (cancelled) return;
        if (res) setData(res);
        else setError('Could not load report. Backend may be starting up.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range.from, range.to, groupBy, type, includeProjections]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Ledger"
        description="Every transaction, filtered and grouped. Switch between grid and notebook views."
      />

      <FilterBar
        view={view} setView={setView}
        type={type} setType={setType}
        groupBy={groupBy} setGroupBy={setGroupBy}
        preset={preset} setPreset={setPreset}
        customFrom={customFrom} setCustomFrom={setCustomFrom}
        customTo={customTo} setCustomTo={setCustomTo}
        includeProjections={includeProjections} setIncludeProjections={setIncludeProjections}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20">
          <Spinner />
          <span className="text-sm text-ink-soft">Loading…</span>
        </div>
      ) : error ? (
        <EmptyState icon={<AlertCircle className="h-12 w-12 text-rose-500" />} title="Failed to load" description={error} />
      ) : !data || data.buckets.length === 0 ? (
        <EmptyState icon={<AlertCircle className="h-12 w-12 text-ink-faint" />} title="No data for this range" description="Adjust your filters or pick a different date range." />
      ) : (
        <>
          <SummaryStats totals={data.totals} />
          {view === 'grid' ? <LedgerGrid buckets={data.buckets} /> : <LedgerNotebook buckets={data.buckets} />}
        </>
      )}
    </div>
  );
}
