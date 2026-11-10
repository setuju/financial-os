'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowRight, User, Lock } from 'lucide-react';
import Link from 'next/link';

const ERR_MAP: Record<string, string> = {
  invalid_credentials: 'Invalid name or password. If new, sign up first.',
  name_and_password_required: 'Enter name and password.',
  backend_unreachable: 'Backend waking up (~50s). Try again.',
};

export default function LoginForm({ from }: { from: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(ERR_MAP[data.error ?? ''] ?? 'Sign in failed. Try again.');
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
        <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-soft">
          Name
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            maxLength={40}
            placeholder="admin or your name"
            className="w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <label htmlFor="password" className="mb-1 mt-3 block text-xs font-medium text-ink-soft">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="financial-os or your signup password"
            className="w-full rounded-md border border-line-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-1.5 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !name.trim() || !password}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Sign in
        </button>
      </form>

      <div className="mt-4 rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink-soft">
        <strong className="text-ink">Admin demo:</strong>{' '}
        <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">admin</code>
        {' / '}
        <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono">financial-os</code>
      </div>

      <div className="mt-4 text-center text-xs text-ink-soft">
        New here?{' '}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create a session →
        </Link>
      </div>
    </>
  );
}
