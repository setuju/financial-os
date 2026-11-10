import Link from 'next/link';
import type { ReactNode } from 'react';
import LandingNav from './LandingNav';
import LandingFooter from './LandingFooter';

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">Last updated: {lastUpdated}</p>
        <div className="mt-8 space-y-4 text-sm text-ink-soft [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:font-medium [&_h3]:text-ink [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-accent [&_a:hover]:underline [&_strong]:text-ink">
          {children}
        </div>
        <p className="mt-12 text-xs text-ink-faint">
          <Link href="/" className="hover:text-ink">← Back to home</Link>
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}
