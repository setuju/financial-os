'use client';

import { useState } from 'react';
import { predictSurplus, type SurplusMetrics, type SurplusPrediction } from '@/lib/api';

interface Props {
  metrics: SurplusMetrics;
  initialPrediction: SurplusPrediction | null;
}

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function SurplusOracleCard({ metrics, initialPrediction }: Props) {
  const [prediction, setPrediction] = useState<SurplusPrediction | null>(initialPrediction);
  const [predictedAmount, setPredictedAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predictedAmount) return;
    
    setLoading(true);
    setError(null);
    const amount = Number(predictedAmount.replace(/\D/g, ''));
    
    const res = await predictSurplus(amount);
    if (res) {
      setPrediction(res);
      setPredictedAmount('');
    } else {
      setError('Failed to save prediction.');
    }
    setLoading(false);
  };

  const formatAmount = (val: number | string) => {
    return rupiah.format(Number(val));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Surplus Oracle</h2>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-xs text-blue-600 font-medium">Total Income</p>
          <p className="text-lg font-semibold text-blue-900">{formatAmount(metrics.totalIncome)}</p>
        </div>
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-xs text-red-600 font-medium">Total Expense</p>
          <p className="text-lg font-semibold text-red-900">{formatAmount(metrics.totalExpense)}</p>
        </div>
        <div className="col-span-2 rounded-md bg-green-50 p-3">
          <p className="text-xs text-green-600 font-medium">Current Surplus</p>
          <p className={`text-2xl font-bold ${metrics.currentSurplus >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatAmount(metrics.currentSurplus)}
          </p>
        </div>
      </div>

      {prediction ? (
        <div className="rounded-md border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Your prediction for next week: <strong className="text-gray-900">{formatAmount(prediction.predicted_amount)}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Prediction made on {new Date(prediction.created_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <form onSubmit={handlePredict} className="flex gap-2">
          <input
            type="text"
            value={predictedAmount}
            onChange={(e) => setPredictedAmount(e.target.value)}
            placeholder="Predicted surplus (e.g. 500000)"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Predict'}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
