/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/layout/NavBar.tsx
 * │  Purpose   : Component: NavBar
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  LayoutDashboard,
  BookOpen,
  Heart,
  Target,
  Table,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LogoutButton from './LogoutButton';
import ResetNavButton from './ResetNavButton';

type HealthStatus = 'ok' | 'degraded' | 'offline';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/ledger', label: 'Ledger', icon: Table },
  { href: '/impact', label: 'Impact', icon: Heart },
  { href: '/horizon', label: 'Horizon', icon: Target },
];

const STATUS_MAP = {
  ok: { label: 'Healthy', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  degraded: { label: 'Degraded', dot: 'bg-amber-500', text: 'text-amber-700' },
  offline: { label: 'Offline', dot: 'bg-rose-500', text: 'text-rose-700' },
} as const;

export default function NavBar({ status }: { status: HealthStatus }) {
  const pathname = usePathname();
  const s = STATUS_MAP[status];
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )fos_name=([^;]+)/);
    if (m) setName(decodeURIComponent(m[1]));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface-raised/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold text-ink"
        >
          <Wallet className="h-5 w-5 text-accent" />
          <span className="hidden sm:inline">Financial OS</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-soft hover:bg-surface-sunken hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {name && (

            <span className="hidden text-xs text-ink-soft sm:inline">

              Hi, <strong className="font-semibold text-ink">{name}</strong>

            </span>

          )}

          <ThemeToggle />
          <ResetNavButton />
          <LogoutButton />
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${s.text}`}
          >
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
