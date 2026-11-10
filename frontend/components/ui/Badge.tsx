/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/ui/Badge.tsx
 * │  Purpose   : Component: Badge
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

import type { ReactNode } from 'react';

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const VARIANTS: Record<Variant, string> = {
  success: 'bg-success-soft text-emerald-800',
  danger: 'bg-danger-soft text-rose-800',
  warning: 'bg-warning-soft text-amber-800',
  info: 'bg-accent-soft text-accent',
  neutral: 'bg-surface-sunken text-ink-soft',
};

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
