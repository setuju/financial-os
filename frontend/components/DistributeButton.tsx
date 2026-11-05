'use client';

import { useState } from 'react';
import { distributeSurplus, PayoutResponse } from '@/lib/api';

export default function DistributeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Email sandbox yang sudah kita uji
  const SANDBOX_EMAIL = 'sb-wyxsu53660889@personal.example.com';

  const handleDistribute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Mengirim $0.05 sebagai contoh
      const res = await distributeSurplus(SANDBOX_EMAIL, 0.05);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Ethical Surplus</h2>
      <p className="mb-6 text-sm text-gray-600">
        You have a validated surplus available for distribution. By clicking below, you explicitly authorize the transfer of $0.05 to a verified impact receiver.
      </p>

      {!result && !error && (
        <button
          onClick={handleDistribute}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing PayPal Payout...' : 'Distribute $0.05 USD'}
        </button>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-900 mb-2">✅ Payout Successful</h3>
          <p className="text-sm text-green-800">
            <strong>Batch ID:</strong> {result.payout.paypal_batch_id}
          </p>
          <p className="text-sm text-green-800">
            <strong>Receiver:</strong> {result.payout.receiver_email}
          </p>
          <p className="text-sm text-green-800">
            <strong>Status:</strong> {result.paypalResponse.batchHeader?.batchStatus ?? 'PENDING'}
          </p>
          <p className="mt-2 text-xs text-green-700">
            Funds are now being processed by PayPal Sandbox.
          </p>
        </div>
      )}
    </div>
  );
}
