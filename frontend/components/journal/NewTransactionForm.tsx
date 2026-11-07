'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { submitTransaction } from '@/app/journal/new/actions';
import VoiceButton from './VoiceButton';
import SubmitButton from './SubmitButton';
import AmountEditor from './AmountEditor';

const EXAMPLES = [
  'spent 20 dollars on coffee this morning',
  'received 500 bonus',
  'paid 120 for utilities',
  'bought groceries for 95',
];

export default function NewTransactionForm() {
  const [text, setText] = useState('');

  return (
    <form action={submitTransaction}>
      <label
        htmlFor="text"
        className="mb-2 block text-sm font-medium text-ink"
      >
        What happened?
      </label>

      <div className="mb-5 flex gap-2">
        <input
          type="text"
          name="text"
          id="text"
          required
          autoFocus
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="spent 20 dollars on coffee this morning"
          className="flex-1 rounded-lg border border-line-strong bg-surface-raised px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <VoiceButton onTranscript={setText} />
      </div>

      <AmountEditor text={text} onChange={setText} />

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
  );
}
