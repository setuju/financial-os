'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

export interface C3Offer {
  price?: number;
  currency?: string;
  merchant?: string;
}

export interface C3Product {
  id: string;
  title: string;
  imageUrl?: string;
  brand?: string;
  merchant?: string;
  offers?: C3Offer[];
  [key: string]: unknown;
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/channel3/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.products || []);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-surface-raised p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Find a Product</h2>
          <button type="button" onClick={onClose} className="text-ink-faint hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., MacBook Pro 14-inch, Sony WH-1000XM5..."
            className="flex-1 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {results.map((product: C3Product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-line p-3 transition-colors hover:border-accent hover:bg-surface-sunken"
            >
              {product.imageUrl && (
                               <img src={product.imageUrl} alt={product.title} className="h-16 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{product.title}</p>
                <p className="text-xs text-ink-soft">{product.brand || product.merchant || 'Unknown'}</p>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {product.offers?.[0]?.price ? `$${product.offers[0].price}` : 'Price N/A'}
                </p>
              </div>
            </div>
          ))}
          {!loading && results.length === 0 && query && (
            <p className="text-center text-sm text-ink-faint">No products found. Try a different search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
