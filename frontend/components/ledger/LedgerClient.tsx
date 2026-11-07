'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, RotateCw, Loader2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
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
import ExportLedgerPdfButton from './ExportLedgerPdfButton';

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

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

async function fetchWithRetry(
  params: { from: string; to: string; groupBy: ReportGroupBy; type: ReportType; includeProjections: boolean },
  onAttempt: (attempt: number) => void,
): Promise<SummaryResponse | null> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    onAttempt(i + 1);
    const res = await getReportSummary(params);
    if (res) return res;
    if (i < MAX_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  return null;
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
  const [attempt, setAttempt] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

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

  const load = async () => {
    abortRef.current = false;
    setLoading(true);
    setError(null);
    setAttempt(1);
    const res = await fetchWithRetry(
      { from: range.from, to: range.to, groupBy, type, includeProjections },
      (a) => { if (!abortRef.current) setAttempt(a); },
    );
    if (abortRef.current) return;
    if (res) {
      setData(res);
    } else {
      setError(
        'Backend did not respond after ' +
          MAX_ATTEMPTS +
          ' attempts. It may still be waking up (Render free tier: ~50s cold start). Wait a moment, then click Retry.',
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    return () => { abortRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to, groupBy, type, includeProjections]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Ledger"
        description="Every transaction, filtered and grouped. Switch between grid and notebook views."
        actions={
          data && data.buckets.length > 0 ? (
            <ExportLedgerPdfButton
              buckets={data.buckets}
              totals={data.totals}
              from={range.from}
              to={range.to}
              groupBy={groupBy}
              type={type}
              includeProjections={includeProjections}
            />
          ) : undefined
        }
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
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
          <p className="text-sm text-ink-soft">
            {attempt > 1 ? `Waking backend… (attempt ${attempt}/${MAX_ATTEMPTS})` : 'Loading ledger…'}
          </p>
          {attempt > 1 && (
            <p className="text-xs text-ink-faint">
              Render free tier cold start can take ~50s. Retrying automatically.
            </p>
          )}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-rose-500" />}
          title="Backend unreachable"
          description={error}
          action={
            <Button onClick={load} icon={<RotateCw className="h-4 w-4" />}>
              Retry
            </Button>
          }
        />
      ) : !data || data.buckets.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-ink-faint" />}
          title="No data for this range"
          description="Adjust your filters or pick a different date range."
        />
      ) : (
        <>
          <SummaryStats totals={data.totals} />
          {view === 'grid' ? <LedgerGrid buckets={data.buckets} /> : <LedgerNotebook buckets={data.buckets} />}
        </>
      )}
    </div>
  );
}
