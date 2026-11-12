'use client';

import { ReactNode } from 'react';

export default function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-surface opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 text-center">
        {text}
        <div className="absolute left-1/2 top-full -ml-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink"></div>
      </div>
    </div>
  );
}
