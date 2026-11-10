/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/app/ledger/page.tsx                           │
 * │  Purpose   : Page: /ledger/page.tsx                                 │
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

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LedgerClient from '@/components/ledger/LedgerClient';

export const dynamic = 'force-dynamic';

function LedgerFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-20">
      <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
      <span className="text-sm text-ink-soft">Loading ledger…</span>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<LedgerFallback />}>
      <LedgerClient />
    </Suspense>
  );
}
