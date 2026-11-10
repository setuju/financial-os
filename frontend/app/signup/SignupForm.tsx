'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, User, Copy, Check, ArrowRight } from 'lucide-react';

const ERR_MAP: Record<string, string> = {
  name_taken: 'That name is already taken. Try a different one.',
  name_reserved: '"admin" is reserved. Choose another name.',
  name_invalid: 'Name must be 2-40 characters.',
  backend_unreachable: 'Backend waking up (~50s). Try again.',
};

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        name?: string;
        password?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(ERR_MAP[data.error ?? ''] ?? 'Signup failed. Try again.');
        return;
      }
      setSuccess({ name: data.name!, password: data.password! });
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyPassword() {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not allowed */
    }
  }

  if (success) {
    return (
      <div>
        <div className="rounded-lg border border-success/30 bg-success-soft p-4">
          <p className="text-sm font-semibold text-success">Session created!</p>
          <p className="mt-2 text-xs text-ink-soft">
            Welcome, <strong className="text-ink">{success.name}</strong>. Save this password — you&apos;ll need it to return.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-md bg-surface px-3 py-2">
            <code className="flex-1 font-mono text-lg font-semibold tracking-wider text-ink">
              {success.password}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              className="rounded p-1.5 text-ink-soft hover:bg-surface-sunken"
              title="Copy password"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-ink-faint">
            This is the only time we show it. Copy now.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            router.push('/dashboard');
            router.refresh();
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-hover"
        >
          Continue to dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="name" className="mb-1 block text-xs font-medium text-ink-soft">
        Your name
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
          minLength={2}
          maxLength={40}
          placeholder="e.g. Judge A, Sam R, Jane"
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
        disabled={busy || name.trim().length < 2}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Generate session
      </button>
    </form>
  );
}
