import type { Metadata } from 'next';
import Link from 'next/link';
import { Wallet, RotateCcw } from 'lucide-react';
import ResetButton from './ResetButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reset Demo',
  description: 'Restore your Financial OS demo session to baseline. Admin re-seeds sample data; other users get an empty slate.',
  alternates: { canonical: '/reset' },
};

export default function ResetPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <Wallet className="h-5 w-5 text-accent" />
            Financial OS
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Reset Demo</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Shared demo — anyone using the site affects the same data within their session.
            If things look broken, reset your session below.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-line bg-surface-raised p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
            <RotateCcw className="h-4 w-4 text-accent" />
            Restore baseline
          </div>
          <p className="mb-4 text-xs text-ink-soft">
            Wipes your session&apos;s transactions, goals, oracles, payouts, and periods.
            <strong className="text-ink"> Admin re-seeds the demo dataset; other users start empty.</strong>
          </p>
          <ResetButton />
          <p className="mt-4 text-[10px] text-ink-faint">
            Takes ~15 seconds. Only affects your session — other users&apos; data is untouched.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
