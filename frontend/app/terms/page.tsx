import LegalPage from '@/components/landing/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="10 November 2026">
      <p>
        By accessing Financial OS you agree to these terms. If you do not agree, do not use
        the app.
      </p>

      <h2>1. Sandbox-only use</h2>
      <p>
        Financial OS is a demonstration application. All PayPal interactions operate against
        the <strong>PayPal Sandbox environment</strong>. No real money is transferred, held,
        or distributed. Any amount shown in the app is synthetic.
      </p>

      <h2>2. Not financial advice</h2>
      <p>
        Financial OS is not a financial advisor, accountant, or tax professional. The
        &ldquo;Ethical Surplus&rdquo; calculation is a demonstration model, not a
        recommendation. Do not rely on it for real financial decisions.
      </p>

      <h2>3. No warranty</h2>
      <p>
        The app is provided &ldquo;as is&rdquo; without warranty of any kind, express or
        implied. The author is not liable for any loss or damage arising from use of the app.
      </p>

      <h2>4. Demo password gate</h2>
      <p>
        Access requires a shared password (displayed on the login page). This is a
        bot-prevention measure only — it is not a security boundary. Do not enter any
        sensitive personal information.
      </p>

      <h2>5. Open-source license</h2>
      <p>
        Source code is released under the <strong>MIT License</strong>. You may use, modify,
        and distribute it under those terms. See the{' '}
        <a href="https://github.com/setuju/financial-os/blob/main/LICENSE">LICENSE</a> file
        on GitHub.
      </p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>Do not use the app for illegal activity</li>
        <li>Do not attempt to probe, scan, or exploit the demo backend</li>
        <li>Do not overload the demo (Render free tier, rate limits apply)</li>
        <li>Do not input sensitive personal financial data</li>
      </ul>

      <h2>7. Changes</h2>
      <p>
        These terms may change as the demo evolves. Continued use after a change constitutes
        acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Jack · Medan, Indonesia ·{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>
      </p>
    </LegalPage>
  );
}
