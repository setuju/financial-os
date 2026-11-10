/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/ui/Spinner.tsx                     │
 * │  Purpose   : Component: Spinner                                     │
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

import { Loader2 } from 'lucide-react';

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-8 w-8' } as const;

export default function Spinner({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Loader2
      className={`animate-spin text-ink-soft ${SIZES[size]} ${className}`}
      aria-hidden
    />
  );
}
