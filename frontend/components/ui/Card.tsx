/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/ui/Card.tsx                        │
 * │  Purpose   : Component: Card                                        │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

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
