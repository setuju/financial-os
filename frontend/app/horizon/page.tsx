/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/app/horizon/page.tsx                          │
 * │  Purpose   : Page: /horizon/page.tsx                                │
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

import { Target, Calendar, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import GanttWrapper from '@/components/horizon/GanttWrapper';
import GoalsSection, { type Goal } from '@/components/horizon/GoalsSection';
import { getGoals, getPredictions } from '@/lib/api';
import SurplusOracleCard from '@/components/SurplusOracleCard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function projectedEnd(goals: Goal[]): string {
  if (goals.length === 0) return '—';
  let max = 0;
  for (const g of goals) {
    const d = new Date(g.start_date);
    if (Number.isNaN(d.getTime())) continue;
    d.setMonth(d.getMonth() + Number(g.duration_months || 0));
    max = Math.max(max, d.getTime());
  }
  if (max === 0) return '—';
  return new Date(max).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

export default async function HorizonPage() {
  const licenseKey = process.env.BRYNTUM_LICENSE_KEY ?? '';

  // Normalize to GoalsSection's Goal shape regardless of api.ts's Goal type
  const [goalsRes, predsData] = await Promise.all([
    getGoals(),
    getPredictions(),
  ]);
  const raw = goalsRes ?? [];
  const rawGoals = raw as unknown as Array<Record<string, unknown>>;
  const goals: Goal[] = rawGoals.map((g) => ({
    id: String(g.id ?? ''),
    name: String(g.name ?? ''),
    target_amount: Number(g.target_amount ?? 0),
    monthly_saving: Number(g.monthly_saving ?? 0),
    interest_rate: Number(g.interest_rate ?? 0),
    loan_term_months: Number(g.loan_term_months ?? 0),
    start_date: String(g.start_date ?? ''),
    duration_months: Number(g.duration_months ?? 0),
    progress_percent: Number(g.progress_percent ?? 0),
  }));

  const totalMonthly = goals.reduce((s, g) => s + g.monthly_saving, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Financial Horizon"
        description="Plan long-term goals — target amounts, monthly savings, interest, and loan terms on a timeline."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Active goals"
          value={String(goals.length)}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Projected end"
          value={projectedEnd(goals)}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Total monthly saving"
          value={`$${totalMonthly.toLocaleString('en-US')}`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
      </div>

      <GoalsSection goals={goals} />

      <div className="mt-8">
        <SurplusOracleCard initialPredictions={predsData?.predictions || []} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Timeline</h2>
        <Card className="overflow-hidden p-0">
          <div className="h-[360px] w-full min-w-0">
            <GanttWrapper licenseKey={licenseKey} goals={goals} />
          </div>
        </Card>
      </div>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Powered by Bryntum Gantt 8 (Enterprise) · Custom fields: targetAmount,
        monthlySaving, interestRate, loanTerm
      </p>
    </div>
  );
}
