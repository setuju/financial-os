'use client';

import dynamic from 'next/dynamic';

const GanttInner = dynamic<{ licenseKey: string }>(
  () => import('./GanttInner'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">Memuat Financial Horizon (Bryntum Gantt)...</p>
      </div>
    ),
  },
);

export default function GanttWrapper({ licenseKey }: { licenseKey: string }) {
  return <GanttInner licenseKey={licenseKey} />;
}
