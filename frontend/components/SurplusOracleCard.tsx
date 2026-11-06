'use client';

import { useState } from 'react';
import { Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { predictSurplus, type SurplusPrediction } from '@/lib/api';
import Card from './ui/Card';
import Button from './ui/Button';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

interface Props {
  initialPrediction: SurplusPrediction | null;
}

export default function SurplusOracleCard({ initialPrediction }: Props) {
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
      setError('Failed to save prediction. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-ink">Surplus Oracle</h2>
      </div>
      <p className="mb-5 text-sm text-ink-soft">
        Predict next week&apos;s surplus. The closer your prediction to reality, the more impact credit you unlock in your Impact Wallet.
      </p>

      {prediction ? (
        <div className="rounded-lg border border-emerald-200 bg-success-soft p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Active prediction
            </p>
          </div>
          <p className="font-mono text-xl font-semibold tabular-nums text-emerald-900">
            {rupiah.format(Number(prediction.predicted_amount))}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            Made on {new Date(prediction.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </p>
        </div>
      ) : (
        <form onSubmit={handlePredict} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={predictedAmount}
            onChange={(e) => setPredictedAmount(e.target.value)}
            placeholder="e.g. 500000"
            className="flex-1 rounded-lg border border-line-strong bg-surface-raised px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />}>
            Save prediction
          </Button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Card>
  );
}
