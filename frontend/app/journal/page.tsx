import Link from 'next/link';
import { getTransactions } from '@/lib/api';

export const dynamic = 'force-dynamic';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function Journal() {
  const transactions = await getTransactions(50);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Journal</h1>
            <p className="text-sm text-gray-600">
              All transactions parsed from natural-language input.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/journal/new"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New
            </Link>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              ← Dashboard
            </Link>
          </div>
        </div>

        {transactions === null ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-900">Backend unreachable</h2>
            <p className="text-sm text-red-800">
              Cannot load transactions. Make sure backend is running at{' '}
              <code>http://localhost:3001</code>.
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <h2 className="mb-2 text-lg font-semibold">No transactions yet</h2>
            <p className="text-sm text-gray-600">
              POST to{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5">
                /transactions
              </code>{' '}
              with body{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5">
                {`{"text":"saya jajan 20ribu"}`}
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                        {dateFmt.format(new Date(tx.occurred_at))}
                      </td>
                      <td className="px-4 py-3">{tx.raw_text}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-mono ${
                          isIncome ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        {isIncome ? '+' : '−'} {rupiah.format(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500">
          {transactions === null
            ? 'Status: unreachable'
            : `Showing ${transactions.length} transaction${transactions.length === 1 ? '' : 's'} (newest first).`}
        </p>
      </div>
    </main>
  );
}
