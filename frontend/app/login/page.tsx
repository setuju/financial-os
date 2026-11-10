import type { Metadata } from 'next';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the Financial OS demo. One shared password for demo access — no account, no email required.',
  alternates: { canonical: '/login' },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const from = searchParams.from ?? '/dashboard';

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Wallet className="h-5 w-5 text-accent" />
            Financial OS
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Sign in to demo</h1>
          <p className="mt-2 text-sm text-ink-soft">
            One shared password prevents bot traffic. No account, no email.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-line bg-surface-raised p-6">
          <LoginForm from={from} />
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          By signing in you agree to the{' '}
          <Link href="/terms" className="text-accent hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
        <p className="mt-2 text-center text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
