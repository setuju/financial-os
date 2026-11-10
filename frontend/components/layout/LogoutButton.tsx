'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handle() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      aria-label="Sign out"
      title="Sign out"
      className="rounded-md p-2 text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
