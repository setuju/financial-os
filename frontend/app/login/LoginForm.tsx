'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginForm({ from }: { from: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Invalid password. Try again.');
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit}>
        <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          placeholder="Enter demo password"
          className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {error && (
          <div className="mt-3 flex items-start gap-1.5 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Sign in
        </button>
      </form>
      <div className="mt-4 rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink-soft">
        <strong className="text-ink">Demo password:</strong>{' '}
        <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">financial-os</code>
        <br />
        Shared gate to prevent bot traffic. Not a real account system.
      </div>
    </>
  );
}
