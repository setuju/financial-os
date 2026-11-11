/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/horizon/GanttWrapper.tsx
 * │  Purpose   : Component: GanttWrapper
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

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { Goal } from '@/lib/api';

const GanttInner = dynamic<{ licenseKey: string; goals: Goal[] }>(
  () => import('./GanttInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
        <p className="text-sm text-ink-soft">Loading Gantt chart...</p>
      </div>
    ),
  },
);

export default function GanttWrapper({
  licenseKey,
  goals,
}: {
  licenseKey: string;
  goals: Goal[];
}) {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { bryntum?: { licenseKey?: string } };
    w.bryntum = w.bryntum || {};
    w.bryntum.licenseKey = licenseKey;
  }

  return <GanttInner licenseKey={licenseKey} goals={goals} />;
}
