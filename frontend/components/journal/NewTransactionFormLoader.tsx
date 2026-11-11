'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Disable SSR for the form — eliminates hydration mismatch entirely.
// Initial paint shows skeleton (~100ms), then form mounts client-side.
// Trade-off accepted: /journal/new is auth-gated (no SEO loss).
const NewTransactionForm = dynamic(
  () => import('./NewTransactionForm'),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="mb-2 block text-sm font-medium text-ink">
          What happened?
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-surface-sunken py-10 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading form…
        </div>
      </div>
    ),
  },
);

export default function NewTransactionFormLoader() {
  return <NewTransactionForm />;
}
