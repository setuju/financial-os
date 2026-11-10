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
    const check = async () => {
      try {
        const res = await fetch('/api/proxy/health', {
          signal: AbortSignal.timeout(3000),
          cache: 'no-store',
        });
        if (!cancelled) setStatus(res.ok ? 'ok' : 'degraded');
      } catch {
        if (!cancelled) setStatus('offline');
      }
    };
    void check();
    const id = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
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
