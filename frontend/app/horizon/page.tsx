import { Target, Calendar, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import GanttWrapper from '@/components/horizon/GanttWrapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default function HorizonPage() {
  const licenseKey = process.env.BRYNTUM_LICENSE_KEY ?? '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Financial Horizon"
        description="Visualize long-term goals with target amounts, monthly savings, interest rates, and loan terms."
      />

      {/* Static summary derived from sample tasks in GanttInner. TODO: derive from live data. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Active goals"
          value="2"
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Projected end"
          value="Mar 2027"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Total monthly saving"
          value="$1,333"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="h-[600px] w-full min-w-0">
          <GanttWrapper licenseKey={licenseKey} />
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Powered by Bryntum Gantt 8 (Enterprise) · Custom fields: targetAmount, monthlySaving, interestRate, loanTerm
      </p>
    </div>
  );
}
