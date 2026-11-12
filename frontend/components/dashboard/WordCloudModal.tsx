'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface TransactionResult {
  raw_text: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  occurred_at: string;
}

export default function WordCloudModal({ word, onClose }: { word: string; onClose: () => void }) {
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/proxy/reports/search?q=${encodeURIComponent(word)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to search');
        setResults(data.transactions || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [word]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-3xl max-h-[80vh] flex flex-col rounded-xl bg-surface-raised p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">
            Transactions matching <span className="text-accent">&quot;{word}&quot;</span>
          </h3>
          <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-surface-sunken">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-soft p-4 text-danger">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-ink-faint py-12">No transactions found for this word.</p>
        ) : (
          <div className="overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-raised border-b border-line text-xs uppercase text-ink-faint">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Keyword</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {results.map((tx, i) => (
                  <tr key={i} className="hover:bg-surface-sunken/50">
                    <td className="py-2">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        tx.type === 'income' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      }`}>
                        {tx.type === 'income' ? 'IN' : 'OUT'}
                      </span>
                    </td>
                    <td className="py-2 whitespace-nowrap text-ink-soft">
                      {new Date(tx.occurred_at).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </td>
                    <td className="py-2">
                      <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                        {word}
                      </span>
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
      </div>
    </div>
  );
}
