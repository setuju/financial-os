'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const GanttInner = dynamic<{ licenseKey: string }>(
  () => import('./GanttInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
        <p className="text-sm text-ink-soft">Loading Financial Horizon...</p>
      </div>
    ),
  },
);

export default function GanttWrapper({ licenseKey }: { licenseKey: string }) {
  if (typeof window !== 'undefined') {
    const w = window as unknown as { bryntum?: { licenseKey?: string } };
    w.bryntum = w.bryntum || {};
    w.bryntum.licenseKey = licenseKey;
  }

  return <GanttInner licenseKey={licenseKey} />;
}
