'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import NavBar from './NavBar';
import AssistantWidget from '@/components/assistant/AssistantWidget';

type HealthStatus = 'ok' | 'degraded' | 'offline';

const PUBLIC_PATHS = ['/', '/login', '/privacy', '/terms', '/legal', '/security', '/support'];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<HealthStatus>('ok');

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname?.startsWith(p + '/')),
  );

  useEffect(() => {
    if (isPublic) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let backoffMs = 0;

    const POLL_MS = 60_000;
    const MAX_BACKOFF_MS = 300_000;

    const check = async () => {
      if (cancelled) return;
      // Skip poll when tab is hidden — no value, wastes requests
      if (document.visibilityState !== 'visible') {
        schedule(POLL_MS);
        return;
      }
      try {
        const res = await fetch('/api/proxy/health', {
          signal: AbortSignal.timeout(8_000),
          cache: 'no-store',
        });
        if (!cancelled) {
          setStatus(res.ok ? 'ok' : 'degraded');
          backoffMs = 0; // reset on success
        }
      } catch (err) {
        if (cancelled) return;
        // Silently ignore abort errors (tab navigation, timeout)
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
          schedule(POLL_MS);
          return;
        }
        if (!cancelled) setStatus('offline');
        // Exponential backoff on network failure
        backoffMs = Math.min(backoffMs === 0 ? 30_000 : backoffMs * 2, MAX_BACKOFF_MS);
      }
      schedule(backoffMs || POLL_MS);
    };

    const schedule = (delay: number) => {
      if (cancelled) return;
      timer = setTimeout(check, delay);
    };

    // Initial check immediately (unless hidden)
    schedule(0);

    // Re-check when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (timer) clearTimeout(timer);
        schedule(0);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isPublic]);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar status={status} />
      <main>{children}</main>
      <AssistantWidget />
    </div>
  );
}
