import type { SummaryBucket } from '@/lib/api';
import Card from '@/components/ui/Card';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LedgerGrid({ buckets }: { buckets: SummaryBucket[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-sunken text-left text-xs uppercase tracking-wider text-ink-faint">
              <th className="border-b border-line px-4 py-3 font-medium">Period</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Income</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Expense</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Net</th>
              <th className="border-b border-line px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b, i) => (
              <tr key={b.label} className={`${i % 2 === 1 ? 'bg-surface-sunken/40' : ''} hover:bg-accent-soft/40`}>
                <td className="border-b border-line px-4 py-2.5 font-mono text-xs text-ink-soft">{b.label}</td>
                <td className="border-b border-line px-4 py-2.5 text-right font-mono tabular-nums text-emerald-600">{b.income > 0 ? usd.format(b.income) : '—'}</td>
                <td className="border-b border-line px-4 py-2.5 text-right font-mono tabular-nums text-rose-600">{b.expense > 0 ? usd.format(b.expense) : '—'}</td>
                <td className={`border-b border-line px-4 py-2.5 text-right font-mono tabular-nums font-medium ${b.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {b.net >= 0 ? '+' : ''}{usd.format(b.net)}
                </td>
                <td className="border-b border-line px-4 py-2.5 text-center">
                  {b.isProjection ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">Projected</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800">Actual</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
