import type { HTMLAttributes } from 'react';

export default function Card({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface-raised p-6 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
