import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
  className?: string;
}

const TONES = {
  neutral: 'text-ink',
  success: 'text-emerald-600',
  danger: 'text-rose-600',
} as const;

export default function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface-raised p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon ? <div className="text-ink-faint">{icon}</div> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </p>
      </div>
      <p
        className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${TONES[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}
