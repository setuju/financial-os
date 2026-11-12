/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/horizon/ProductSearchDialog.tsx
 * │  Purpose   : Channel3 Product Search Modal
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

import { useState } from 'react';
import { Search, Loader2, X, AlertCircle } from 'lucide-react';

export interface C3Product {
  id: string;
  title: string;
  offers?: Array<{ price?: string | number; currency?: string }>;
  image_url?: string;
}

interface Props {
  onSelectProduct: (product: C3Product) => void;
  onClose: () => void;
}

export default function ProductSearchDialog({ onSelectProduct, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<C3Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/channel3/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to search products');
      setResults(data.products || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-lg rounded-xl bg-surface-raised p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Search Real Products</h3>
          <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-surface-sunken">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. MacBook Pro, iPhone 15, House..."
            className="flex-1 rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {results.length === 0 && !loading && !error && query && (
            <p className="text-center text-sm text-ink-faint py-8">No products found. Try another keyword.</p>
          )}
          {results.map((p) => {
            const price = p.offers?.[0]?.price;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="flex w-full items-center justify-between rounded-lg border border-line p-3 text-left transition-colors hover:border-accent hover:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                  {price && <p className="text-xs text-ink-soft">${price}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
