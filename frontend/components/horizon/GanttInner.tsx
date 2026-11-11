/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/horizon/GanttInner.tsx
 * │  Purpose   : Component: GanttInner
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

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BryntumGantt } from '@bryntum/gantt-react-enterprise';
import type { GanttConfig, TaskModel } from '@bryntum/gantt-enterprise';

import '@bryntum/gantt-enterprise/gantt.css';
import '@bryntum/core-enterprise/svalbard.css';
import type { Goal } from './GoalsSection';

interface CustomTask extends TaskModel {
  targetAmount: number;
  monthlySaving: number;
  interestRate: number;
  loanTerm: number;
}

export default function GanttInner({
  licenseKey,
  goals,
}: {
  licenseKey: string;
  goals: Goal[];
}) {
  const [config, setConfig] = useState<GanttConfig | null>(null);
  const ganttRef = useRef<BryntumGantt>(null);

  if (typeof window !== 'undefined') {
    const w = window as unknown as { bryntum?: { licenseKey?: string } };
    w.bryntum = w.bryntum || {};
    w.bryntum.licenseKey = licenseKey;
  }

  useEffect(() => {
    const data: Partial<CustomTask>[] = goals.map((g) => ({
      id: g.id as unknown as number,
      name: g.name,
      startDate: new Date(g.start_date),
      duration: Number(g.duration_months) || 1,
      durationUnit: 'month',
      percentDone: Number(g.progress_percent) || 0,
      targetAmount: Number(g.target_amount),
      monthlySaving: Number(g.monthly_saving),
      interestRate: Number(g.interest_rate),
      loanTerm: Number(g.loan_term_months),
    }));

    const now = Date.now();
    let minStart = now;
    let maxEnd = now + 1000 * 60 * 60 * 24 * 30;
    if (data.length > 0) {
      const starts: number[] = [];
      const ends: number[] = [];
      for (const t of data) {
        const sd = t.startDate as unknown as Date;
        const s = new Date(sd).getTime();
        if (!Number.isNaN(s)) {
          starts.push(s);
          const dur = Number(t.duration) || 1;
          const e = new Date(sd);
          e.setMonth(e.getMonth() + dur);
          ends.push(e.getTime());
        }
      }
      if (starts.length > 0) {
        minStart = Math.min(...starts);
        maxEnd = Math.max(...ends);
      }
    }

    setConfig({
      columns: [],
      tasks: data as CustomTask[],
      detectCSSCompatibilityIssues: false,
      viewPreset: 'monthAndYear',
      startDate: new Date(minStart),
      endDate: new Date(maxEnd),
      barMargin: 14,
      rowHeight: 48,
      features: {
        criticalPaths: { disabled: true },
        projectLines: { disabled: false },
        labels: { left: { field: 'name' } },
      },
    });
  }, [goals]);

  if (!config) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
        <p className="text-sm text-ink-soft">Loading Gantt chart...</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-ink-soft">
        Add goals above to see the timeline.
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <BryntumGantt ref={ganttRef} {...config} />
    </div>
  );
}
