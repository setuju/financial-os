import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  ArrowRight,
  ScanLine,
  Mic,
  Shield,
  GitBranch,
} from 'lucide-react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Financial OS — Natural-language finance with ethical surplus',
  description: 'Track money with words in English. Four AI modalities, ethical surplus cascade, PayPal Payouts sandbox. Built for PayPal AI Hackathon 2026.',
  alternates: { canonical: '/' },
};

const FEATURES = [
  { icon: ScanLine, title: 'Anti-Budget Parser', desc: 'Type or speak in English. Rejects plans and cancellations.' },
  { icon: Mic, title: 'Voice + OCR', desc: 'Speak transactions or scan receipts. Amount editor for corrections.' },
  { icon: Shield, title: 'Ethical Surplus', desc: 'Only surplus after obligations. Principal savings never touched.' },
  { icon: Heart, title: 'Impact Wallet', desc: 'Verified surplus routes to vetted causes via PayPal Payouts sandbox.' },
];

const STEPS = [
  { n: 1, title: 'Sign in or create a session', desc: 'Type any name — we generate a 5-char password. No email, no PII. Each session sees only its own data.' },
  { n: 2, title: 'Record transactions — type or speak', desc: 'Try "spent 20 on coffee" or "paid 120 for utilities". Parser extracts amount, category, type.' },
  { n: 3, title: 'Plan goals in Horizon', desc: "Add long-term goals with monthly savings. Horizon bills subtract from each month's surplus before distribution." },
  { n: 4, title: 'Distribute verified surplus', desc: "Only last month's closing surplus is distributable. Route up to 10% to vetted causes via PayPal Payouts sandbox." },
];

const TECH = [
  'Next.js 14', 'Fastify 4', 'PostgreSQL (Neon)', 'Redis (Upstash)', 'Elastic Cloud',
  'PayPal Payouts', 'APIMatic', 'Bryntum Gantt 8', 'Google Gemini', 'OpenRouter',
  'Vercel', 'Render',
];

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Financial OS',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description:
      'Natural-language personal finance with ethical surplus distribution via PayPal Payouts. Four AI modalities: text, voice, OCR, chat.',
    url: 'https://financial.saturumah.net',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: 'Jack', url: 'https://saturumah.net' },
    publisher: { '@type': 'Organization', name: 'SatuRumah', url: 'https://saturumah.net' },
    featureList: [
      'Natural-language parser (English)',
      'Voice input via Web Speech API',
      'OCR receipt scan (Groq Qwen + OCR.space)',
      'Scoped AI assistant',
      'Financial Horizon (Bryntum Gantt)',
      'Surplus Oracle',
      'Impact Wallet (PayPal Payouts sandbox)',
      'Ledger with 36 filter combinations',
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-surface">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Sandbox demo · No real money moves
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
              Track money with words.
              <br />
              <span className="text-accent">Give with intent.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft">
              Natural-language finance with ethical surplus distribution. Type or speak
              transactions, plan long-term goals, and route surplus to vetted causes via
              PayPal Payouts.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
              >
                Sign in to demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/setuju/financial-os"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
              >
                <GitBranch className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-faint">
              Free demo · Password on the next page · No account needed
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-line bg-surface-raised">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-ink">What Financial OS does</h2>
              <p className="mt-3 text-base text-ink-soft">Four AI modalities, one ethical model.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-lg border border-line bg-surface p-5">
                  <f.icon className="h-5 w-5 text-accent" />
                  <h3 className="mt-3 text-sm font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-ink">How to use</h2>
            <div className="mx-auto mt-12 max-w-3xl space-y-8">
              {STEPS.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {s.n}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical model */}
        <section className="border-t border-line bg-surface-raised">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">The Ethical Surplus model</h2>
            <p className="mt-4 text-base text-ink-soft">
              Most finance apps treat every dollar left as disposable. Financial OS calculates
              surplus only after obligations are covered — and never touches principal savings.
            </p>
            <pre className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface p-4 text-sm text-ink">
{`closing = opening + income - expense - horizon_bills - donations

Jul 2026  closing -> Aug 2026  opening
Aug 2026  closing -> Sep 2026  opening
...`}
            </pre>
            <p className="mt-4 text-sm text-ink-soft">
              Each month&apos;s closing becomes the next month&apos;s opening. Distributable
              surplus = last month&apos;s closing. Donations are subtracted from the month they
              were made in.
            </p>
          </div>
        </section>

        {/* Tech */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-ink">Technology used</h2>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {TECH.map((t) => (
                <span key={t} className="rounded-full border border-line bg-surface-raised px-3 py-1 text-xs font-medium text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-line bg-accent-soft/30">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Try the demo</h2>
            <p className="mt-2 text-sm text-ink-soft">No account. No real money. Just the app.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
      </div>
    </>
  );
}
