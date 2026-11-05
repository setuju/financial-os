'use client';

import { useState } from 'react';
import { distributeSurplus, type PayoutResponse } from '@/lib/api';

export default function DistributeButton({ currentSurplus }: { currentSurplus: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SANDBOX_EMAIL = 'sb-wyxsu53660889@personal.example.com';
  
  // Ekonomi: Kita hanya mendistribusikan 10% dari surplus, atau minimal $0.01
  const calculatedAmount = Math.max(0.01, Number((currentSurplus * 0.1).toFixed(2)));
  
  // Konversi ke Rupiah untuk tampilan (estimasi kasar 15.000 IDR = 1 USD)
  const estimatedRupiah = Math.floor(calculatedAmount * 15000);
  const rupiahFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const handleDistribute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await distributeSurplus(SANDBOX_EMAIL, calculatedAmount);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const isSurplusNegative = currentSurplus <= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Ethical Surplus Distribution</h2>
      
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600 mb-1">Validated Current Surplus</p>
        <p className={`text-2xl font-bold ${isSurplusNegative ? 'text-red-600' : 'text-green-600'}`}>
          {rupiahFormatter.format(currentSurplus)}
        </p>
      </div>

      {isSurplusNegative ? (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          You do not have a positive surplus to distribute. Please record more income or reduce expenses in your Journal.
        </div>
      ) : !result && !error ? (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Based on your surplus, we suggest distributing <strong>${calculatedAmount} USD</strong> (approx. {rupiahFormatter.format(estimatedRupiah)}) to a verified impact receiver.
          </p>
          <button
            onClick={handleDistribute}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing PayPal Payout...' : `Distribute $${calculatedAmount} USD`}
          </button>
        </>
      ) : null}

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
            <strong>Amount:</strong> ${result.payout.amount} USD
          </p>
          <p className="mt-2 text-xs text-green-700">
            Funds are now being processed by PayPal Sandbox.
          </p>
        </div>
      )}
    </div>
  );
}
