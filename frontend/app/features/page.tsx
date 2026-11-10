import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen, Mic, ScanLine, Table, FileDown, Target, Sparkles,
  Heart, Shield, MessageCircle, Moon, FileText, ArrowRight,
  Check, CircleDot,
} from 'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'All 12 features and 7-step user journey. Parser, voice, OCR receipts, Ledger, Journal, Financial Horizon, Surplus Oracle, Impact Wallet, scoped AI assistant, dark mode.',
  alternates: { canonical: '/features' },
};

interface Feature {
  icon: typeof BookOpen;
  title: string;
  tagline: string;
  body: string;
  tooltip: string;
}

const GROUPS: Array<{ label: string; features: Feature[] }> = [
  { label: 'Input — capture money in natural language', features: [
    { icon: FileText, title: 'Anti-Budget Parser', tagline: 'Type or speak. No forms.', body: 'Natural language in English or Bahasa Indonesia. Extracts amount (USD or IDR), type, and category (12 categories). Rejects plans and cancellations.', tooltip: 'Try "spent 20 on coffee" or "bayar listrik 1.250.000"' },
    { icon: Mic, title: 'Voice Input', tagline: 'Speak transactions hands-free.', body: 'Browser-native Web Speech API. After speaking, an inline AmountEditor lets you correct ASR misfires before submitting.', tooltip: 'Click mic → speak → review amount → submit' },
    { icon: ScanLine, title: 'OCR Receipt Scan', tagline: 'Photograph or upload. Auto-fill.', body: 'Upload a receipt image. Gemini 3 Flash (Google AI Studio) extracts merchant, items, and total. Values pre-fill the form for review — image not stored on our servers.', tooltip: 'Receipt images are not stored on our servers' },
  ]},
  { label: 'Tracking — review and audit', features: [
    { icon: BookOpen, title: 'Journal', tagline: 'Every transaction, one list.', body: 'Newest-first with pagination (20/50/100/all), inline edit (re-parses raw text), soft-delete with audit trail. PDF export as A4 report.', tooltip: 'Raw text preserved verbatim for audit' },
    { icon: Table, title: 'Ledger', tagline: 'Grid, notebook, and 36 filters.', body: 'Group by day/week/month/year, filter income/expense, toggle projections, sort any column. Monthly view shows opening + closing balances.', tooltip: 'Click column headers to sort asc/desc' },
    { icon: FileDown, title: 'PDF Export', tagline: 'Reports you can share.', body: 'Journal and Ledger both export to PDF. Ledger PDF preserves filter context + monthly opening/closing columns. Row numbering, right-aligned numerics.', tooltip: 'Click "Download PDF" on Journal or Ledger' },
  ]},
  { label: 'Planning — future-focused', features: [
    { icon: Target, title: 'Financial Horizon', tagline: 'Long-term goals on a timeline.', body: 'Add goals with target amount, monthly saving, interest rate, duration. Auto-computes duration from target ÷ monthly. Bryntum Gantt 8 with month/year scale.', tooltip: 'Horizon bills subtract from each month\'s surplus' },
    { icon: Sparkles, title: 'Surplus Oracle', tagline: 'Predict. Track. Achieve.', body: 'Predict next week or month\'s surplus. Define what you\'re saving for. When you hit it, mark achieved — celebration modal + trophy badge.', tooltip: 'Used to unlock impact credit' },
  ]},
  { label: 'Impact — distribute ethical surplus', features: [
    { icon: Heart, title: 'Impact Wallet', tagline: 'Give from surplus, never principal.', body: 'Verified surplus from last month (or current month on first month) is available to distribute. Route up to 10% to vetted causes via PayPal Payouts sandbox.', tooltip: 'Principal savings are never touched' },
    { icon: Shield, title: 'Surplus Cascade', tagline: 'Accounting that adds up.', body: 'Month-to-month closing balance flows into next month\'s opening. Horizon bills and donations subtract at their source. Full audit trail.', tooltip: 'closing = opening + income − expense − horizon − donations' },
  ]},
  { label: 'AI & UX — scoped and safe', features: [
    { icon: MessageCircle, title: 'Scoped Assistant', tagline: 'Explains the app, refuses everything else.', body: 'Floating assistant explains features, syntax, troubleshooting. Refuses coding, off-topic, financial advice, jailbreaks. Canary-protected. Dual-provider fallback (OpenRouter → Gemini).', tooltip: 'Ask "how do I add a transaction?"' },
    { icon: Moon, title: 'Dark Mode', tagline: 'Light or dark, your call.', body: 'CSS-variable-based theme with 300ms smooth inversion. Persists via localStorage. Zero flash on load.', tooltip: 'Toggle in the navigation bar' },
  ]},
];

const JOURNEY = [
  { step: 1, title: 'Sign up', action: 'Enter a name (no email). Receive a 5-character password.', effect: 'New isolated session. Data never mixes with others.', url: '/signup' },
  { step: 2, title: 'Record a transaction', action: 'Type or speak "spent 20 on coffee". Or scan a receipt.', effect: 'Parser extracts amount, type, category. Saved with raw text for audit.', url: '/journal/new' },
  { step: 3, title: 'Review your Journal', action: 'See every transaction newest-first. Edit or delete.', effect: 'Edits re-parse raw text. Deletes logged (audit trail kept).', url: '/journal' },
  { step: 4, title: 'Analyze the Ledger', action: 'Filter by day/week/month. Sort any column. Toggle projections.', effect: 'Monthly view shows opening + closing so you can trace cashflow.', url: '/ledger' },
  { step: 5, title: 'Plan goals in Horizon', action: 'Add "Emergency Fund $10,000 at $500/mo". Duration auto-fills.', effect: 'Gantt timeline renders. Monthly savings subtract from surplus.', url: '/horizon' },
  { step: 6, title: 'Predict surplus in Oracle', action: 'Add "Next month $2,500". Optionally explain why.', effect: 'Tracked separately from actual. Mark achieved when hit.', url: '/horizon' },
  { step: 7, title: 'Distribute from Impact Wallet', action: 'Review verified surplus. Pick a cause. Confirm twice.', effect: 'PayPal Payouts executes (sandbox). Batch ID shown.', url: '/impact' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Financial OS Features',
  description: 'Full feature overview + user journey map for Financial OS.',
  url: 'https://financial.saturumah.net/features',
  isPartOf: { '@type': 'WebSite', name: 'Financial OS', url: 'https://financial.saturumah.net' },
  about: { '@type': 'SoftwareApplication', name: 'Financial OS', applicationCategory: 'FinanceApplication', operatingSystem: 'Web' },
};

export default function FeaturesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-surface">
        <LandingNav />
        <main>
          <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />Feature Overview
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Everything in Financial OS</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft">Four AI modalities, three views of your money, one ethical model. Hover any card for a quick hint.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs">
                <Link href="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover">Try the demo <ArrowRight className="h-3.5 w-3.5" /></Link>
                <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface-raised px-4 py-2 font-medium text-ink hover:bg-surface-sunken">Back to home</Link>
              </div>
            </div>
          </section>

          <section className="border-t border-line">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              {GROUPS.map((group) => (
                <div key={group.label} className="mb-16 last:mb-0">
                  <div className="mb-6 flex items-center gap-3">
                    <CircleDot className="h-4 w-4 text-accent" />
                    <h2 className="text-lg font-semibold tracking-tight text-ink">{group.label}</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.features.map((f) => (
                      <div key={f.title} title={f.tooltip} className="group rounded-lg border border-line bg-surface-raised p-5 transition-all hover:border-accent/50 hover:shadow-sm">
                        <f.icon className="h-5 w-5 text-accent" />
                        <h3 className="mt-3 text-sm font-semibold text-ink">{f.title}</h3>
                        <p className="mt-1 text-xs font-medium text-accent">{f.tagline}</p>
                        <p className="mt-2 text-xs leading-relaxed text-ink-soft">{f.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-line bg-surface-raised">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
              <div className="text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-ink">User Journey Map</h2>
                <p className="mt-2 text-sm text-ink-soft">What you see, what you do, what happens next — step by step.</p>
              </div>
              <ol className="mt-12 space-y-4">
                {JOURNEY.map((j, i) => (
                  <li key={j.step} className="relative">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">{j.step}</div>
                        {i < JOURNEY.length - 1 && <div className="mt-2 h-full w-px flex-1 bg-line" />}
                      </div>
                      <div className="flex-1 rounded-lg border border-line bg-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold text-ink">{j.title}</h3>
                          <Link href={j.url} className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-accent hover:underline">{j.url} <ArrowRight className="h-3 w-3" /></Link>
                        </div>
                        <p className="mt-2 text-xs text-ink-soft"><strong className="text-ink">What you do:</strong> {j.action}</p>
                        <p className="mt-1 text-xs text-ink-soft"><strong className="text-ink">What happens:</strong> {j.effect}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-10 rounded-lg border border-accent/30 bg-accent-soft/40 p-5">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-ink">You are in control at every step.</p>
                    <p className="mt-1 text-xs text-ink-soft">No auto-donations. No hidden transactions. Every payout requires two explicit confirmations. Principal savings are never touched.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-line">
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Ready to try it?</h2>
              <p className="mt-2 text-sm text-ink-soft">Sign up with a name, get a 5-character password, start in under a minute.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent-hover">Sign up <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-5 py-3 text-sm font-medium text-ink hover:bg-surface-sunken">Already have a password</Link>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
