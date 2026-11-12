/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/dashboard/DashboardSearch.tsx
 * │  Purpose   : Elasticsearch Global Search Bar
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 */

'use client';

import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

interface TransactionResult {
  raw_text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurred_at: string;
}

export default function DashboardSearch() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all');
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/proxy/reports/search?q=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to search');
      setResults(data.transactions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Global Search (Elasticsearch)</h3>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions by keyword..."
            className="w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'all' | 'income' | 'expense')}
          className="rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {hasSearched && !loading && !error && results.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-faint">No transactions found matching your criteria.</p>
      )}

      {results.length > 0 && (
        <div className="max-h-[300px] overflow-y-auto mt-4">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface-raised border-b border-line text-xs uppercase text-ink-faint">
              <tr>
                <th className="pb-2">Type</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {results.map((tx, i) => (
                <tr key={i} className="hover:bg-surface-sunken/50">
                  <td className="py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase ${
                      tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                    }`}>
                      {tx.type === 'income' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td className="py-2 whitespace-nowrap text-ink-soft">
                    {new Date(tx.occurred_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                  </td>
                  <td className="py-2 text-ink">{tx.raw_text}</td>
                  <td className={`py-2 text-right font-mono ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
