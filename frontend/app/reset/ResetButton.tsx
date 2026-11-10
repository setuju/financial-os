'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetButton() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handle() {
    if (state === 'loading') return;
    if (!confirm('Reset your session data? This cannot be undone.')) return;
    setState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        transactions?: number;
        is_admin?: boolean;
        error?: string;
      };
      if (res.ok && data.ok) {
        setState('success');
        setMessage(
          data.is_admin
            ? `Baseline restored: ${data.transactions} transactions`
            : 'Session cleared — you now start fresh',
        );
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
        return;
      }
      if (res.status === 401) {
        setState('error');
        setMessage('Sign in first, then click reset.');
        return;
      }
      setState('error');
      setMessage(data.error ?? 'Reset failed.');
    } catch {
      setState('error');
      setMessage('Network error.');
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handle}
        disabled={state === 'loading'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {state === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {state === 'loading' ? 'Resetting… (~15s)' : 'Reset session'}
      </button>
      {message && (
        <div
          className={`mt-3 flex items-start gap-1.5 rounded-md px-3 py-2 text-xs ${
            state === 'success'
              ? 'border border-success/30 bg-success-soft text-success'
              : 'border border-danger/30 bg-danger-soft text-danger'
          }`}
        >
          {state === 'error' ? (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
