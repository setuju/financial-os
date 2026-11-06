import { redirect } from 'next/navigation';
import { Sparkles, AlertCircle } from 'lucide-react';
import { createTransaction } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import SubmitButton from '@/components/journal/SubmitButton';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  no_amount: 'No amount found in your text. Try "saya jajan 20ribu" or "gaji 5jt".',
  invalid_input: 'Please enter some text describing the transaction.',
  zero_amount: 'Amount cannot be zero.',
  network_error: 'Could not reach backend. Is it running on port 3001?',
  empty: 'Please enter some text describing the transaction.',
};

const EXAMPLES = [
  'saya jajan 20ribu tadi pagi di warteg',
  'tadi dapat bonus 500rb',
  'bayar listrik 1.250.000',
  'bensin 50rb',
];

async function submitTransaction(formData: FormData) {
  'use server';
  const text = String(formData.get('text') ?? '').trim();
  if (!text) {
    redirect('/journal/new?error=empty');
  }
  const result = await createTransaction(text);
  if (!result.ok) {
    redirect(`/journal/new?error=${result.error}`);
  }
  redirect('/journal');
}

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
        description="Type in Bahasa Indonesia — the parser extracts amount, type, and category."
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
        <form action={submitTransaction}>
          <label
            htmlFor="text"
            className="mb-2 block text-sm font-medium text-ink"
          >
            What happened?
          </label>
          <input
            type="text"
            name="text"
            id="text"
            required
            autoFocus
            maxLength={500}
            placeholder="saya jajan 20ribu tadi pagi di warteg"
            className="mb-5 w-full rounded-lg border border-line-strong bg-surface-raised px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />

          <div className="mb-5 rounded-lg bg-surface-sunken p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
              <Sparkles className="h-3.5 w-3.5" />
              Examples
            </p>
            <ul className="space-y-1">
              {EXAMPLES.map((ex) => (
                <li
                  key={ex}
                  className="rounded bg-surface-raised px-2 py-1 font-mono text-xs text-ink-soft"
                >
                  {ex}
                </li>
              ))}
            </ul>
          </div>

          <SubmitButton />

          <p className="mt-4 text-center text-xs text-ink-faint">
            Your raw input is stored verbatim alongside the parsed transaction —
            you can always audit exactly what you typed.
          </p>
        </form>
      </Card>
    </div>
  );
}
