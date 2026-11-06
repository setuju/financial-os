'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BryntumGantt } from '@bryntum/gantt-react-enterprise';
import type { GanttConfig, TaskModel } from '@bryntum/gantt-enterprise';

import '@bryntum/gantt-enterprise/gantt.css';
import '@bryntum/core-enterprise/svalbard.css';

interface CustomTask extends TaskModel {
  targetAmount: number;
  monthlySaving: number;
  interestRate: number;
  loanTerm: number;
}

export default function GanttInner({ licenseKey }: { licenseKey: string }) {
  const [config, setConfig] = useState<GanttConfig | null>(null);
  const ganttRef = useRef<BryntumGantt>(null);

  if (typeof window !== 'undefined') {
    const w = window as unknown as { bryntum?: { licenseKey?: string } };
    w.bryntum = w.bryntum || {};
    w.bryntum.licenseKey = licenseKey;
  }

  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const data: Partial<CustomTask>[] = [
      {
        id: 1,
        name: 'Emergency Fund (Target: $10,000)',
        startDate: today,
        duration: 12,
        durationUnit: 'month',
        percentDone: 25,
        targetAmount: 10000,
        monthlySaving: 833,
        interestRate: 2.5,
        loanTerm: 0,
      },
      {
        id: 2,
        name: 'New Car Down Payment (Target: $5,000)',
        startDate: nextMonth,
        duration: 10,
        durationUnit: 'month',
        percentDone: 10,
        targetAmount: 5000,
        monthlySaving: 500,
        interestRate: 0,
        loanTerm: 36,
      },
    ];

    setConfig({
      columns: [
        { type: 'name', width: 250, text: 'Financial Goal' },
        { type: 'startdate', text: 'Start', width: 100 },
        { type: 'duration', text: 'Duration', width: 100 },
        { type: 'percentdone', text: 'Progress', width: 100 },
        { field: 'targetAmount', text: 'Target ($)', width: 110, editor: 'number' },
        { field: 'monthlySaving', text: 'Monthly ($)', width: 110, editor: 'number' },
        { field: 'interestRate', text: 'Interest (%)', width: 110, editor: 'number' },
      ],
      tasks: data as CustomTask[],
      features: {
        criticalPaths: { disabled: false },
        projectLines: { disabled: false },
        labels: { left: { field: 'name' } },
      },
    });
  }, []);

  if (!config) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
        <p className="text-sm text-ink-soft">Loading Financial Horizon...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <BryntumGantt ref={ganttRef} {...config} />
    </div>
  );
}
