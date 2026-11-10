/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/journal/AmountEditor.tsx           │
 * │  Purpose   : Component: AmountEditor                                │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Match first number in text: optional $, digits with optional comma
// thousands separators, optional decimal. Examples that match:
//   "spent 20 dollars"      -> 20
//   "paid $120.50 for X"    -> 120.50
//   "spent 1,500 on rent"   -> 1500
const NUMBER_RE = /(\$?\s*\d[\d,]*(?:\.\d+)?)/;

interface Detected {
  value: number;
  index: number;
  length: number;
  hasDollar: boolean;
}

function extractFirstNumber(text: string): Detected | null {
  const m = text.match(NUMBER_RE);
  if (!m) return null;
  const raw = m[0];
  const cleaned = raw.replace(/[\$,\s]/g, '');
  const value = parseFloat(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    value,
    index: m.index ?? 0,
    length: raw.length,
    hasDollar: raw.includes('$'),
  };
}

export default function AmountEditor({
  text,
  onChange,
}: {
  text: string;
  onChange: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const detected = extractFirstNumber(text);
  if (!detected) return null;

  const startEdit = () => {
    setDraft(String(detected.value));
    setEditing(true);
  };

  const save = () => {
    const newNum = parseFloat(draft);
    if (!Number.isFinite(newNum) || newNum <= 0) {
      setEditing(false);
      return;
    }
    // Replace only the first detected number, preserving $ if original
    // had it (keeps parser happy + UX natural).
    const before = text.slice(0, detected.index);
    const after = text.slice(detected.index + detected.length);
    const replacement = detected.hasDollar ? `$${newNum}` : String(newNum);
    onChange(`${before}${replacement}${after}`);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  return (
    <div className="mb-5 rounded-lg border border-line bg-surface-sunken p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          Detected amount
        </p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  save();
                }
                if (e.key === 'Escape') cancel();
              }}
              className="w-32 rounded border border-line-strong bg-surface-raised px-2 py-1 text-right font-mono text-sm tabular-nums text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={save}
              title="Save amount"
              className="rounded bg-accent p-1.5 text-white hover:bg-accent-hover"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={cancel}
              title="Cancel"
              className="rounded border border-line bg-surface-raised p-1.5 text-ink-soft hover:bg-surface"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-semibold tabular-nums text-ink">
              {usd.format(detected.value)}
            </span>
            <button
              type="button"
              onClick={startEdit}
              title="Edit amount"
              className="rounded p-1.5 text-ink-soft transition-colors hover:bg-surface-raised hover:text-accent"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {editing && (
        <p className="mt-2 text-[11px] text-ink-faint">
          Press Enter to save, Escape to cancel. Only the first number is
          replaced in your text.
        </p>
      )}
    </div>
  );
}
