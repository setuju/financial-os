'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';

export default function ResetNavButton() {
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (busy) return;
    if (!confirm('Reset all your demo data? Admin re-seeds baseline; other users get an empty slate. This cannot be undone.')) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) {
        alert('Reset failed. Try again.');
        return;
      }
      window.location.reload();
    } catch {
      alert('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      aria-label="Reset demo data"
      title="Reset demo data"
      className="rounded-md p-2 text-ink-soft transition-colors hover:bg-warning-soft hover:text-warning focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
    </button>
  );
}
