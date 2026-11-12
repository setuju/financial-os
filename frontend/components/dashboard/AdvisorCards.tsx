/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/dashboard/AdvisorCards.tsx
 * │  Purpose   : AI Financial Advisors (Financial, Cashier, Insider)
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 12-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   12-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useState } from 'react';
import { Lock, Sparkles, Loader2, Brain, Briefcase, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { Transaction } from '@/lib/api';

const ADVISORS = [
  {
    id: 'financial',
    name: 'Financial-Advisor',
    desc: 'Macro-level auditor. Risk & health.',
    icon: Briefcase,
    color: 'text-blue-500',
  },
  {
    id: 'cashier',
    name: 'Ombar-The Cashier',
    desc: 'Frontline habits & daily leaks.',
    icon: User,
    color: 'text-emerald-500',
  },
  {
    id: 'insider',
    name: 'Stephen-The Insider',
    desc: 'Brutally honest ex-employee.',
    icon: Brain,
    color: 'text-purple-500',
  },
] as const;

export default function AdvisorCards({ transactions }: { transactions: Transaction[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const isUnlocked = transactions.length >= 100;

  async function getAdvice(personaId: string) {
    setLoadingId(personaId);
    setError(null);

    try {
      const res = await fetch('/api/proxy/assistant/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: personaId }),
        signal: AbortSignal.timeout(35000),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setError(data.message || 'Data insufficient.');
        } else {
          setError(data.error || 'Failed to get advice.');
        }
        return;
      }

      setResults(prev => ({ ...prev, [personaId]: data.reply }));
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-ink">AI Financial Advisors</h2>
        </div>
        <span className="text-xs text-ink-faint">
          {isUnlocked ? 'Pro Feature Unlocked' : `Locked (${transactions.length}/100 tx)`}
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {ADVISORS.map((adv) => (
          <Card key={adv.id} className={`relative flex flex-col ${!isUnlocked ? 'opacity-80' : ''}`}>
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-surface/80 backdrop-blur-sm p-4 text-center">
                <Lock className="mb-2 h-6 w-6 text-ink-faint" />
                <p className="text-xs font-medium text-ink">Too low data to compute.</p>
                <p className="mt-1 text-[10px] text-ink-soft">Reach 100 transactions to unlock.</p>
              </div>
            )}

            <div className="mb-3 flex items-center gap-2">
              <adv.icon className={`h-5 w-5 ${adv.color}`} />
              <h3 className="text-sm font-semibold text-ink">{adv.name}</h3>
            </div>
            
            <p className="mb-4 text-xs text-ink-soft">{adv.desc}</p>

            {results[adv.id] ? (
              <div className="rounded-md bg-surface-sunken p-3 text-sm text-ink leading-relaxed">
                {results[adv.id]}
              </div>
            ) : (
              <div className="mt-auto pt-4">
                <button
                  onClick={() => getAdvice(adv.id)}
                  disabled={!isUnlocked || loadingId !== null}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
                >
                  {loadingId === adv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {loadingId === adv.id ? 'Analyzing...' : 'Get Advice'}
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
