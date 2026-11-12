/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/dashboard/AdvancedStats.tsx
 * │  Purpose   : Advanced dashboard metrics (Runway, Health, Top 5, Cloud)
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

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import type { Transaction, Goal, SurplusMetrics } from '@/lib/api';

interface Props {
  transactions: Transaction[];
  goals: Goal[];
  metrics: SurplusMetrics;
}

export default function AdvancedStats({ transactions, goals, metrics }: Props) {
  // 1. Top 5 Largest Expenses
  const topExpenses = useMemo(() => {
    return [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5);
  }, [transactions]);

  // 2. Financial Health Score (0-100)
  // Rumus: 50 poin dasar + (Rasio Tabungan x 50). Max 100.
  const healthScore = useMemo(() => {
    if (metrics.totalIncome === 0) return 0;
    const savingsRatio = metrics.currentSurplus / metrics.totalIncome;
    let score = 50 + (savingsRatio * 50);
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return Math.round(score);
  }, [metrics]);

  // 3. Financial Runway (Berapa bulan uang bertahan)
  // Rumus: Current Surplus / Rata-rata pengeluaran bulanan (dari 3 bulan terakhir)
  const runwayMonths = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0 || metrics.currentSurplus <= 0) return 0;
    
    const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgMonthlyExpense = totalExpense / 3; // Asumsi data 3 bulan
    if (avgMonthlyExpense === 0) return 0;
    
    return (metrics.currentSurplus / avgMonthlyExpense).toFixed(1);
  }, [transactions, metrics]);

  // 4. Transaction Frequency (Hari dalam seminggu)
  const frequencyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    transactions.forEach(t => {
      const d = new Date(t.occurred_at).getDay();
      counts[d]++;
    });
    return days.map((name, i) => ({ name, Transactions: counts[i] }));
  }, [transactions]);

  // 5. Word Cloud (Kata terbanyak dari raw_text)
  const wordCloud = useMemo(() => {
    const stopWords = new Set(['the', 'and', 'from', 'with', 'for', 'your', 'this', 'that', 'have', 'was', 'were', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'out', 'get', 'has', 'him', 'his', 'how', 'man', 'one', 'our', 'out', 'own']);
    const wordCount: Record<string, number> = {};
    
    transactions.forEach(t => {
      const words = t.raw_text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      words.forEach(w => {
        if (w.length > 2 && !stopWords.has(w)) {
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [transactions]);

  const scoreColor = healthScore >= 80 ? 'text-success' : healthScore >= 50 ? 'text-warning' : 'text-danger';
  const scoreBg = healthScore >= 80 ? 'bg-success-soft' : healthScore >= 50 ? 'bg-warning-soft' : 'bg-danger-soft';

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Financial Health Score */}
      <Card className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2"><h3 className="text-sm font-semibold text-ink">Financial Health</h3><span title="A score from 0-100 based on your income-to-savings ratio. 80+ is excellent." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        <div className={`flex h-24 w-24 items-center justify-center rounded-full ${scoreBg} mb-2`}>
          <span className={`text-4xl font-bold ${scoreColor}`}>{healthScore}</span>
        </div>
        <p className="text-xs text-ink-soft">Based on savings ratio</p>
      </Card>

      {/* Financial Runway */}
      <Card className="flex flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2"><h3 className="text-sm font-semibold text-ink">Financial Runway</h3><span title="Estimates how many months you can survive without new income based on average monthly expenses." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        <p className="text-4xl font-bold text-accent mb-1">{runwayMonths}</p>
        <p className="text-xs text-ink-soft">Months you can survive<br/>without new income</p>
      </Card>

      {/* Goals Progress */}
      <Card>
        <div className="flex items-center gap-1.5 mb-3"><h3 className="text-sm font-semibold text-ink">Horizon Goals</h3><span title="Progress bars for your long-term financial goals from the Horizon page." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        {goals.length === 0 ? (
          <p className="text-xs text-ink-faint">No goals set.</p>
        ) : (
          <div className="space-y-3">
            {goals.slice(0, 3).map(g => (
              <div key={g.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink">{g.name}</span>
                  <span className="font-mono text-ink-soft">{g.progress_percent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${g.progress_percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Top 5 Expenses */}
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-1.5 mb-3"><h3 className="text-sm font-semibold text-ink">Top 5 Largest Expenses</h3><span title="The biggest single expenses recorded recently." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-ink-faint">
              <tr>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {topExpenses.map((t, i) => (
                <tr key={i} className="hover:bg-surface-sunken/50">
                  <td className="py-2 truncate max-w-[200px]" title={t.raw_text}>{t.raw_text}</td>
                  <td className="py-2 text-right font-mono text-danger">-${Number(t.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Frequency */}
      <Card>
        <div className="flex items-center gap-1.5 mb-4"><h3 className="text-sm font-semibold text-ink">Transaction Frequency</h3><span title="Shows which days of the week you are most active with transactions." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="Transactions" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Word Cloud */}
      <Card className="lg:col-span-3">
        <div className="flex items-center gap-1.5 mb-4"><h3 className="text-sm font-semibold text-ink">Most Frequent Words</h3><span title="Visualizes the most common words in your journal entries, proving our Natural Language Parser works." className="cursor-help inline-flex items-center"><Info className="h-3.5 w-3.5 text-ink-faint cursor-help" /></span></div>
        <div className="flex flex-wrap gap-2 items-center justify-center py-4">
          {wordCloud.map(([word, count]) => {
            const size = Math.max(12, Math.min(24, 12 + count * 2));
            return (
              <span
                key={word}
                className="text-accent font-semibold opacity-80 hover:opacity-100 transition-opacity"
                style={{ fontSize: `${size}px` }}
                title={`${count} occurrences`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
