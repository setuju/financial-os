'use client';

import { useState } from 'react';
import { Send, Sparkles, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { predictSurplus, updateSurplusPrediction, deleteSurplusPrediction, type SurplusPrediction } from '@/lib/api';
import Card from './ui/Card';
import Button from './ui/Button';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERIODS = [
  { value: 'next_week', label: 'Next week' },
  { value: 'next_month', label: 'Next month' },
  { value: 'this_year', label: 'This year (until Dec 31)' },
  { value: 'next_year', label: 'Next year' },
];

interface Props {
  initialPredictions: SurplusPrediction[];
}

export default function SurplusOracleCard({ initialPredictions }: Props) {
  const [predictions, setPredictions] = useState<SurplusPrediction[]>(initialPredictions);
  const [predictedAmount, setPredictedAmount] = useState('');
  const [period, setPeriod] = useState(PERIODS[0].value);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setPredictedAmount('');
    setPeriod(PERIODS[0].value);
    setReason('');
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!predictedAmount) return;
    setLoading(true);
    setError(null);
    const amount = Number(predictedAmount.replace(/\D/g, ''));
    
    let res: SurplusPrediction | null = null;
    if (editingId) {
      res = await updateSurplusPrediction(editingId, amount, period, reason);
      if (res) {
        setPredictions(prev => prev.map(p => p.id === editingId ? res! : p));
      }
    } else {
      res = await predictSurplus(amount, period, reason);
      if (res) {
        setPredictions(prev => [res!, ...prev]);
      }
    }

    if (res) {
      resetForm();
    } else {
      setError('Failed to save prediction. Please try again.');
    }
    setLoading(false);
  };

  const handleEdit = (p: SurplusPrediction) => {
    setEditingId(p.id);
    setPredictedAmount(String(p.predicted_amount));
    setPeriod(p.period || 'next_week');
    setReason(p.reason || '');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prediction?')) return;
    const ok = await deleteSurplusPrediction(id);
    if (ok) {
      setPredictions(prev => prev.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    } else {
      setError('Failed to delete prediction.');
    }
  };

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-ink">Surplus Oracle</h2>
      </div>
      <p className="mb-5 text-sm text-ink-soft">
        Predict future surplus and define what you are saving for. The closer your prediction, the more impact credit you unlock.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-surface-sunken p-4">
        <h3 className="mb-3 text-sm font-medium text-ink">
          {editingId ? 'Edit Prediction' : 'Add New Prediction'}
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="mb-1 block text-xs text-ink-soft">Target Amount</label>
            <input
              type="text"
              value={predictedAmount}
              onChange={(e) => setPredictedAmount(e.target.value)}
              placeholder="e.g. 500"
              required
              className="w-full rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink-soft">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
            >
              {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-xs text-ink-soft">What are you saving for? (Optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. New laptop, Emergency fund"
            className="w-full rounded-md border border-line-strong bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={loading} icon={editingId ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}>
            {editingId ? 'Update Prediction' : 'Save Prediction'}
          </Button>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      </form>

      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-ink-faint">Your Predictions</h3>
        {predictions.length === 0 ? (
          <p className="text-sm text-ink-soft">No predictions yet.</p>
        ) : (
          predictions.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-line p-3 bg-surface-raised">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold text-emerald-600">{usd.format(Number(p.predicted_amount))}</span>
                  <span className="text-xs font-medium uppercase text-ink-soft bg-surface-sunken px-2 py-0.5 rounded">
                    {PERIODS.find(per => per.value === p.period)?.label || p.period}
                  </span>
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  {p.reason || <span className="italic opacity-50">No reason specified</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(p)} className="p-1.5 text-ink-soft hover:bg-surface-sunken hover:text-accent rounded" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-ink-soft hover:bg-danger-soft hover:text-danger rounded" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
