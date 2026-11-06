import { AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import NewTransactionForm from '@/components/journal/NewTransactionForm';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  no_amount: 'No amount found in your text. Try "spent 20 dollars on coffee".',
  invalid_input: 'Please enter some text describing the transaction.',
  zero_amount: 'Amount cannot be zero.',
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
        <NewTransactionForm />
      </Card>
    </div>
  );
}
