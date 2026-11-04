import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createTransaction } from '@/lib/api';

export const dynamic = 'force-dynamic';

const ERROR_MESSAGES: Record<string, string> = {
  no_amount: 'No amount found in your text. Try "saya jajan 20ribu" or "gaji 5jt".',
  invalid_input: 'Please enter some text describing the transaction.',
  zero_amount: 'Amount cannot be zero.',
  network_error: 'Could not reach backend. Is it running on port 3001?',
  empty: 'Please enter some text describing the transaction.',
};

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
  const errMessage = errCode ? (ERROR_MESSAGES[errCode] ?? 'Unknown error.') : null;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">New Transaction</h1>
            <p className="text-sm text-gray-600">
              Type in Bahasa Indonesia — the parser extracts amount, type, and category.
            </p>
          </div>
          <Link href="/journal" className="text-sm text-blue-600 hover:underline">
            ← Journal
          </Link>
        </div>

        {errMessage ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errMessage}
          </div>
        ) : null}

        <form action={submitTransaction} className="rounded-lg border border-gray-200 bg-white p-6">
          <label htmlFor="text" className="mb-2 block text-sm font-medium">
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
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          <div className="mb-4 text-xs text-gray-500">
            <strong>Examples:</strong>
            <ul className="ml-4 mt-1 list-disc space-y-0.5">
              <li>saya jajan 20ribu tadi pagi di warteg</li>
              <li>tadi dapat bonus 500rb</li>
              <li>bayar listrik 1.250.000</li>
              <li>bensin 50rb</li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Parse &amp; Save
          </button>

          <p className="mt-4 text-xs text-gray-500">
            Your raw input is stored verbatim alongside the parsed transaction — you can always audit exactly what you typed.
          </p>
        </form>
      </div>
    </main>
  );
}
