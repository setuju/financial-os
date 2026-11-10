'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X, BookOpen, Target, Heart } from 'lucide-react';

const KEY = 'fos_onboard_dismissed_v1';

const STEPS = [
  { icon: BookOpen, title: 'Record transactions', desc: 'Type "spent 20 on coffee" or scan a receipt', href: '/journal/new' },
  { icon: Target, title: 'Plan goals in Horizon', desc: 'Add long-term goals with monthly savings', href: '/horizon' },
  { icon: Heart, title: 'Distribute ethical surplus', desc: 'Route verified surplus to vetted causes', href: '/impact' },
];

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="mb-6 rounded-lg border border-accent/30 bg-accent-soft/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold text-ink">Welcome to Financial OS</p>
            <p className="mt-1 text-xs text-ink-soft">
              Here is how to get started in three steps:
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss onboarding"
          title="Dismiss"
          className="rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {STEPS.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            title={s.desc}
            className="group rounded-md border border-line bg-surface-raised p-3 transition-colors hover:border-accent/50"
          >
            <s.icon className="h-4 w-4 text-accent" />
            <p className="mt-2 text-xs font-medium text-ink group-hover:text-accent">
              {s.title}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-soft">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <Link
          href="/features"
          title="See all features + full User Journey Map"
          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
        >
          See the full journey map <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-ink-faint hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
