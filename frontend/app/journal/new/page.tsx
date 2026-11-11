/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/journal/new/page.tsx
 * │  Purpose   : Page: /journal/new/page.tsx
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

import { AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import NewTransactionFormLoader from '@/components/journal/NewTransactionFormLoader';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  no_amount: 'No amount found in your text. Try "spent 20 dollars on coffee".',
  invalid_input: 'Please enter some text describing the transaction.',
  zero_amount: 'Amount cannot be zero.',
  negated_input: "This looks like a cancellation or refusal (\"don't want\", \"change my mind\"). No transaction was recorded.",
  planned_input: "This looks like a plan or intention (\"want to\", \"planning to\", \"hopefully\"), not a completed transaction. Record it only after you actually spend or receive the money.",
  network_error: 'Could not reach backend. Is it running on port 3001?',
  empty: 'Please enter some text describing the transaction.',
};

interface PageProps {
  searchParams: { error?: string | string[] };
}

export default function NewTransactionPage({ searchParams }: PageProps) {
  const raw = searchParams.error;
  const errCode = Array.isArray(raw) ? raw[0] : raw;
  const errMessage = errCode
    ? ERROR_MESSAGES[errCode] ?? 'Unknown error.'
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeader
        title="New Transaction"
        description="Type or speak — the parser extracts amount, type, and category from natural language."
        backHref="/journal"
        backLabel="Journal"
      />

      {errMessage ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-danger-soft p-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{errMessage}</p>
        </div>
      ) : null}

      <Card>
        <NewTransactionFormLoader />
      </Card>
    </div>
  );
}
