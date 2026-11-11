import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Wallet className="h-4 w-4 text-accent" />
              Financial OS
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Natural-language finance with ethical surplus distribution. Sandbox demo.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Product</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/login" className="text-ink-soft hover:text-ink">Sign in</Link></li>
              <li>
                <a href="https://github.com/setuju/financial-os" target="_blank" rel="noopener noreferrer" className="text-ink-soft hover:text-ink">
                  Source code
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/privacy" className="text-ink-soft hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-ink-soft hover:text-ink">Terms of Service</Link></li>
              <li><Link href="/legal" className="text-ink-soft hover:text-ink">Legal &amp; Disclosures</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/reset" className="text-ink-soft hover:text-ink">Reset demo</Link></li>
              <li><Link href="/security" className="text-ink-soft hover:text-ink">Security &amp; Privacy</Link></li>
              <li><Link href="/support" className="text-ink-soft hover:text-ink">Support &amp; Disputes</Link></li>
              <li>
                <a href="mailto:Jack@SatuRumah.net" className="text-ink-soft hover:text-ink">Jack@SatuRumah.net</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 border-t border-line pt-6 text-center text-[10px] text-ink-faint">
          <p>
            Disclaimer: News feeds and disaster alerts are aggregated from third-party sources (USGS, Google News). 
            Financial OS is not responsible for the accuracy, imagery, or content provided by external organizations.
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row">

          <p>© 2026 Jack · Medan, Indonesia · MIT License</p>
          <p>Built for PayPal AI Hackathon 2026</p>
        </div>
      </div>
    </footer>
  );
}
