'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Pencil, Check, X } from 'lucide-react';
import { submitTransactions } from '@/app/journal/new/actions';
import VoiceButton from './VoiceButton';
import SubmitButton from './SubmitButton';
import ReceiptScanButton from './ReceiptScanButton';

const EXAMPLES = ['spent 20 dollars on coffee', 'received 500 bonus', 'bought groceries for 95'];

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
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PreviewTx | null>(null);

  useEffect(() => {
    if (!text.trim()) { setPreviewTxs([]); setParseError(null); return; }
    const timer = setTimeout(async () => {
      setIsParsing(true); setParseError(null);
      try {
        const res = await fetch('/api/proxy/transactions/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (!res.ok) { setParseError(data.error || 'Failed to parse'); setPreviewTxs([]); }
        else { setPreviewTxs(data.transactions || []); }
      } catch { setParseError('Network error.'); } finally { setIsParsing(false); }
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  const saveEdit = () => {
    if (editingIdx !== null && editForm) {
      const newTxs = [...previewTxs]; newTxs[editingIdx] = editForm; setPreviewTxs(newTxs);
      setEditingIdx(null); setEditForm(null);
    }
  };

  return (
    <form action={submitTransactions}>
      <input type="hidden" name="transactions" value={JSON.stringify(previewTxs)} />
      <label htmlFor="text" className="mb-2 block text-sm font-medium text-ink">What happened?</label>
      <div className="mb-2 flex gap-2">
        <input type="text" name="text" id="text" required autoFocus maxLength={500} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. i got 1000 from mom and buy coffee 5" className="flex-1 rounded-lg border border-line-strong bg-surface-raised px-4 py-3 text-lg text-ink focus:border-accent focus:outline-none" />
        <VoiceButton onTranscript={setText} onError={setVoiceError} />
      </div>
      <ReceiptScanButton onExtracted={setText} />
      
      <div className="mb-5 mt-6 rounded-xl border border-line bg-surface-raised p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink"><Sparkles className="h-4 w-4 text-accent" /> Live Preview</h3>
          {isParsing && <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />}
        </div>
        {parseError ? <p className="text-sm text-danger">{parseError}</p> : previewTxs.length === 0 && text.trim() ? <p className="text-sm text-ink-faint">Typing...</p> : previewTxs.length === 0 ? <p className="text-sm text-ink-faint">Your parsed transactions will appear here.</p> : (
          <ul className="space-y-2">
            {previewTxs.map((tx, i) => (
              <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3 text-sm">
                {editingIdx === i && editForm ? (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} className="w-24 rounded border border-line px-2 py-1 text-sm" />
                    <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as 'income'|'expense'})} className="rounded border border-line px-2 py-1 text-sm">
                      <option value="income">IN</option><option value="expense">OUT</option>
                    </select>
                    <input type="text" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-28 rounded border border-line px-2 py-1 text-sm" />
                    <button type="button" onClick={saveEdit} className="text-success"><Check className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setEditingIdx(null)} className="text-danger"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {tx.type === 'income' ? 'IN' : 'OUT'}:{tx.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="truncate text-xs text-ink-soft max-w-[200px] italic">&quot;{tx.rawText}&quot;</span>
                      <button type="button" onClick={() => { setEditingIdx(i); setEditForm({...tx}); }} className="text-ink-faint hover:text-accent"><Pencil className="h-4 w-4" /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={!previewTxs.length ? 'opacity-50 pointer-events-none' : ''}>
        <SubmitButton />
      </div>
    </form>
  );
}
