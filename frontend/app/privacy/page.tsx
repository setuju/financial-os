import LegalPage from '@/components/landing/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="10 November 2026">
      <p>
        Financial OS is a sandbox demonstration app built for the PayPal AI Hackathon 2026.
        This policy explains what data we process, where it goes, and how to request deletion.
      </p>

      <h2>What we process</h2>
      <ul>
        <li>Transaction raw text you enter (preserved verbatim for audit)</li>
        <li>Parsed amount, category, transaction type, timestamp</li>
        <li>Goals, Oracle predictions, donation logs</li>
        <li>Anonymous health checks (uptime monitoring only — no PII)</li>
      </ul>

      <h2>Third-party processors</h2>
      <ul>
        <li>
          <strong>PayPal Payouts (sandbox)</strong> — donation amounts and recipient emails
          are sent to PayPal&apos;s sandbox API. No real money moves.
        </li>
        <li>
          <strong>Google Gemini (via Google AI Studio)</strong> — receipt images you upload
          for OCR are sent for text extraction. Images are not stored on our servers.
        </li>
        <li>
          <strong>OpenRouter</strong> — AI assistant chat messages are processed to generate
          scoped replies. No conversation history is persisted beyond the session.
        </li>
      </ul>

      <h2>What we do NOT process</h2>
      <ul>
        <li>No user accounts, no email addresses, no PII beyond what you type</li>
        <li>No tracking pixels, no ad networks, no third-party analytics beacons</li>
        <li>No cookies beyond a single session gate (HttpOnly, 7-day expiry)</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        Demo data is periodically wiped between hackathon sessions. Transactions, goals, and
        donation logs are stored in Neon (Postgres, Singapore region). Session cookies expire
        after 7 days.
      </p>

      <h2>Data deletion</h2>
      <p>
        To request deletion of all data associated with your session, email{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>. Response within 7 days.
      </p>

      <h2>Contact</h2>
      <p>
        Jack · Medan, Indonesia ·{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>
      </p>
    </LegalPage>
  );
}
