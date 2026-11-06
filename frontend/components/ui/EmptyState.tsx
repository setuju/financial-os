import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface-raised px-6 py-16 text-center">
      <div className="mb-4 text-ink-faint">{icon}</div>
      <h2 className="mb-1 text-lg font-semibold text-ink">{title}</h2>
      <p className="mb-6 max-w-md text-sm text-ink-soft">{description}</p>
      {action}
    </div>
  );
}
