'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { submitTransaction } from '@/app/journal/new/actions';
import VoiceButton from './VoiceButton';
import SubmitButton from './SubmitButton';
import AmountEditor from './AmountEditor';
import ReceiptScanButton from './ReceiptScanButton';

const EXAMPLES = [
  'spent 20 dollars on coffee this morning',
  'received 500 bonus',
  'paid 120 for utilities',
  'bought groceries for 95',
];

interface PreviewTx {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  rawText: string;
}

export default function NewTransactionForm() {
  const [text, setText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const [previewTxs, setPreviewTxs] = useState<PreviewTx[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setPreviewTxs([]);
      setParseError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsParsing(true);
      setParseError(null);
      try {
        const res = await fetch('/api/proxy/transactions/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (!res.ok) {
          setParseError(data.error || 'Failed to parse input');
          setPreviewTxs([]);
        } else {
          setPreviewTxs(data.transactions || []);
          setParseError(null);
        }
      } catch {
        setParseError('Network error. Is backend awake?');
      } finally {
        setIsParsing(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <form action={submitTransaction}>
      <label htmlFor="text" className="mb-2 block text-sm font-medium text-ink">
        What happened?
      </label>

      <div className="mb-2 flex gap-2">
        <input
          type="text"
          name="text"
          id="text"
          required
          autoFocus
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. i got 1000 from mom and buy coffee 5"
          className="flex-1 rounded-lg border border-line-strong bg-surface-raised px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <VoiceButton onTranscript={setText} onError={setVoiceError} />
      </div>

      <ReceiptScanButton onExtracted={setText} />

      {voiceError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-ink">
          <span className="mt-0.5 flex-shrink-0 text-warning">⚠️</span>
          <span className="flex-1">{voiceError}</span>
          <button
            type="button"
            onClick={() => setVoiceError(null)}
            aria-label="Dismiss voice error"
            className="ml-2 rounded px-1 text-xs text-ink-soft hover:bg-surface-sunken"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-5 mt-6 rounded-xl border border-line bg-surface-raised p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-accent" />
            Live Preview
          </h3>
          {isParsing && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
        </div>

        {parseError ? (
          <p className="text-sm text-danger">{parseError}</p>
        ) : previewTxs.length === 0 && text.trim() ? (
          <p className="text-sm text-ink-faint">Typing...</p>
        ) : previewTxs.length === 0 ? (
          <p className="text-sm text-ink-faint">Your parsed transactions will appear here as you type.</p>
        ) : (
          <ul className="space-y-2">
            {previewTxs.map((tx, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-line bg-surface p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                  <span className="rounded bg-surface-sunken px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                    {tx.category}
                  </span>
                </div>
                <span className="truncate text-xs text-ink-soft max-w-[200px] italic">
                  &quot;{tx.rawText}&quot;
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AmountEditor text={text} onChange={setText} />

      <div className="mb-5 rounded-lg bg-surface-sunken p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
          <Sparkles className="h-3.5 w-3.5" />
          Examples
        </p>
        <ul className="space-y-1">
          {EXAMPLES.map((ex) => (
            <li key={ex} className="rounded bg-surface-raised px-2 py-1 font-mono text-xs text-ink-soft">
              {ex}
            </li>
          ))}
        </ul>
      </div>

      <div className={!previewTxs.length ? 'opacity-50 pointer-events-none' : ''}>
        <SubmitButton />
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Your raw input is stored verbatim alongside the parsed transaction — you can always audit exactly what you typed.
      </p>
    </form>
  );
}
