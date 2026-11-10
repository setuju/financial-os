import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Wallet className="h-5 w-5 text-accent" />
          <span>Financial OS</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="hidden text-ink-soft hover:text-ink sm:inline" title="Privacy policy \u2014 what we process, third-party providers">Privacy</Link>
          <Link href="/terms" className="hidden text-ink-soft hover:text-ink sm:inline" title="Terms of service \u2014 sandbox-only, no financial advice">Terms</Link>
          <Link
            href="/login"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
