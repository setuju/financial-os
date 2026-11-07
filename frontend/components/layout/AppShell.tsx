import type { ReactNode } from 'react';
import { getHealth } from '@/lib/api';
import NavBar from './NavBar';
import AssistantWidget from '@/components/assistant/AssistantWidget';

type HealthStatus = 'ok' | 'degraded' | 'offline';

export default async function AppShell({ children }: { children: ReactNode }) {
  const health = await getHealth();
  const status: HealthStatus = !health
    ? 'offline'
    : health.status === 'ok'
      ? 'ok'
      : 'degraded';

  return (
    <div className="min-h-screen bg-surface">
      <NavBar status={status} />
      <main>{children}</main>
      <AssistantWidget />
    </div>
  );
}
