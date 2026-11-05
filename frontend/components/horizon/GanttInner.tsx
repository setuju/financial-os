'use client';

import { useEffect, useRef, useState } from 'react';
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
  // Gunakan tipe class BryntumGantt untuk ref
  const ganttRef = useRef<BryntumGantt>(null);

  // Safe global assignment tanpa deklarasi ulang dan tanpa 'any'
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

  if (!config) return <div className="p-8 text-center text-gray-500">Memuat Gantt Chart...</div>;

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <BryntumGantt ref={ganttRef} {...config} />
    </div>
  );
}
