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

import { Info } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

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

const COLORS = ['#0070ba', '#059669', '#e11d48', '#d97706', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9'];
const CATEGORY_COLORS: Record<string, string> = {
  income: '#0070ba', freelance: '#8b5cf6', investment: '#0ea5e9', bonus: '#f59e0b', pocket_money: '#10b981',
  food: '#ec4899', groceries: '#22c55e', transport: '#6366f1', utilities: '#eab308', shopping: '#f97316',
  health: '#ef4444', entertainment: '#d946ef', subscription: '#14b8a6', gift: '#f43f5e', donation: '#64748b', other: '#a1a1aa'
};

const getColor = (name: string, index: number) => CATEGORY_COLORS[name] || COLORS[index % COLORS.length];

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
    name: new Date(b.period).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    Income: b.income,
    Expense: b.expense,
  })) || [];

  const surplusData = impactSurplus?.history.map(h => ({
    name: h.period.slice(0, 7), // YYYY-MM
    Surplus: h.closing_surplus,
  })).reverse() || [];

  const donationData = payouts?.map(p => {
    // Mengubah "redcross-sandbox@example.com" menjadi "Redcross"
    const rawName = p.receiver_email.split('@')[0].replace('-sandbox', '').replace(/-/g, ' ');
    const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    return {
      name: cleanName,
      Amount: Number(p.amount),
    };
  }).reverse() || [];

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {/* 1. Income vs Expense Flow (Bar) */}
      <Card className="col-span-1 sm:col-span-2">
        <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-ink">Income vs Expense (Monthly)</h3><Tooltip text="Compares your total income and expenses on a monthly basis."><Info className="h-3.5 w-3.5 text-ink-faint cursor-help cursor-help" /></Tooltip></div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
              <YAxis stroke="#52525b" fontSize={12} tickFormatter={(v) => `${v}`} domain={[0, 'auto']} />
              <RechartsTooltip formatter={formatCurrency} />
              <Legend />
              <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Top Income (Pie) */}
      <Card>
        <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-ink">Top Income Categories</h3><Tooltip text="Shows where your income comes from (e.g., salary, freelance, bonuses)."><Info className="h-3.5 w-3.5 text-ink-faint cursor-help cursor-help" /></Tooltip></div>
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
                  <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
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
        <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-ink">Top Expense Categories</h3><Tooltip text="Shows where your money goes (e.g., food, utilities, shopping)."><Info className="h-3.5 w-3.5 text-ink-faint cursor-help cursor-help" /></Tooltip></div>
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
                  <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
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
        <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-ink">Surplus Trend (6 Months)</h3><Tooltip text="Tracks your ethical surplus (income minus expenses and obligations) over the last 6 months."><Info className="h-3.5 w-3.5 text-ink-faint cursor-help cursor-help" /></Tooltip></div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={surplusData}>
              <defs>
                <linearGradient id="colorSurplus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0070ba" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0070ba" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
              <YAxis stroke="#52525b" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <RechartsTooltip formatter={formatCurrency} />
              <Area type="monotone" dataKey="Surplus" stroke="#0070ba" fillOpacity={1} fill="url(#colorSurplus)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5. Donation Log (Bar) */}
      <Card>
        <div className="flex items-center gap-1.5"><h3 className="text-sm font-semibold text-ink">Donation Log</h3><Tooltip text="Displays your PayPal sandbox payouts to vetted causes."><Info className="h-3.5 w-3.5 text-ink-faint cursor-help cursor-help" /></Tooltip></div>
        <div className="h-[250px] w-full flex items-center justify-center">
          {donationData.length === 0 ? (
            <p className="text-sm text-ink-faint">No donations yet. Distribute surplus from the Impact Wallet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} />
                <YAxis stroke="#52525b" fontSize={12} tickFormatter={(v) => `${v}`} />
                <RechartsTooltip formatter={formatCurrency} />
                <Bar dataKey="Amount" fill="#0070ba" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
