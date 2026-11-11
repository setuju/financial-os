/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/dashboard/DashboardCharts.tsx
 * │  Purpose   : Dashboard visualizations (Income, Expense, Surplus, Payouts)
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   12-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import type {
  SummaryResponse,
  CategorySummary,
  ImpactSurplusResponse,
  PayoutRecord
} from '@/lib/api';
import Card from '@/components/ui/Card';


// Helper to format tooltip values safely without triggering ESLint 'any' rule globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatCurrency = (value: any) => `$${Number(value || 0).toFixed(2)}`;

const COLORS = ['var(--accent)', 'var(--success)', 'var(--danger)', 'var(--warning)', '#8b5cf6', '#ec4899'];

interface Props {
  summaryData: SummaryResponse | null;
  incomeCatData: { categories: CategorySummary[] } | null;
  expenseCatData: { categories: CategorySummary[] } | null;
  impactSurplus: ImpactSurplusResponse | null;
  payouts: PayoutRecord[] | null;
}

export default function DashboardCharts({ summaryData, incomeCatData, expenseCatData, impactSurplus, payouts }: Props) {
  // Formatting data untuk Recharts
  const flowData = summaryData?.buckets.map(b => ({
    name: b.label,
    Income: b.income,
    Expense: b.expense,
  })) || [];

  const surplusData = impactSurplus?.history.map(h => ({
    name: h.period.slice(0, 7), // YYYY-MM
    Surplus: h.closing_surplus,
  })).reverse() || [];

  const donationData = payouts?.map(p => ({
    name: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Amount: Number(p.amount),
  })).reverse() || [];

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {/* 1. Income vs Expense Flow (Bar) */}
      <Card className="col-span-1 sm:col-span-2">
        <h3 className="mb-4 text-sm font-semibold text-ink">Income vs Expense (Monthly)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={12} />
              <YAxis stroke="var(--ink-soft)" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <RechartsTooltip formatter={formatCurrency} />
              <Legend />
              <Bar dataKey="Income" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Top Income (Pie) */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-ink">Top Income Categories</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeCatData?.categories || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {(incomeCatData?.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={formatCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Top Expense (Pie) */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-ink">Top Expense Categories</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseCatData?.categories || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {(expenseCatData?.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={formatCurrency} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Surplus Trend (Area) */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-ink">Surplus Trend (6 Months)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={surplusData}>
              <defs>
                <linearGradient id="colorSurplus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={12} />
              <YAxis stroke="var(--ink-soft)" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <RechartsTooltip formatter={formatCurrency} />
              <Area type="monotone" dataKey="Surplus" stroke="var(--accent)" fillOpacity={1} fill="url(#colorSurplus)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5. Donation Log (Bar) */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-ink">Donation Log</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={donationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="name" stroke="var(--ink-soft)" fontSize={12} />
              <YAxis stroke="var(--ink-soft)" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <RechartsTooltip formatter={formatCurrency} />
              <Bar dataKey="Amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
