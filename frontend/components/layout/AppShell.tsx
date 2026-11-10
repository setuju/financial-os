/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/layout/AppShell.tsx                │
 * │  Purpose   : Component: AppShell                                    │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

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
