import LegalPage from '@/components/landing/LegalPage';

export default function SupportPage() {
  return (
    <LegalPage title="Support & Dispute Center" lastUpdated="10 November 2026">
      <p>
        Financial OS is a solo-developer hackathon demo. There is no customer support team,
        but the developer responds to all inquiries.
      </p>

      <h2>Contact</h2>
      <ul>
        <li>
          <strong>Email:</strong> <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>{' '}
          — primary support channel
        </li>
        <li>
          <strong>GitHub Issues:</strong>{' '}
          <a href="https://github.com/setuju/financial-os/issues" target="_blank" rel="noopener noreferrer">
            github.com/setuju/financial-os/issues
          </a>{' '}
          — bug reports, feature requests
        </li>
        <li>
          <strong>Owner:</strong> Jack · Medan, Indonesia
        </li>
      </ul>

      <h2>Response time</h2>
      <ul>
        <li>Non-urgent: within 7 days</li>
        <li>Security reports: within 48 hours</li>
        <li>Hackathon judging window: best-effort within 24 hours</li>
      </ul>

      <h2>Dispute resolution</h2>
      <p>
        Because Financial OS operates entirely in PayPal Sandbox, <strong>no real
        transactions can be disputed</strong>. Donation entries in the demo are synthetic.
        If you believe a specific demo action caused a real-world impact, contact the
        developer with:
      </p>
      <ul>
        <li>Timestamp (UTC) of the action</li>
        <li>Batch ID shown in the app (if donation-related)</li>
        <li>Description of what you expected vs. observed</li>
      </ul>

      <h2>What we can help with</h2>
      <ul>
        <li>Bug reports (parser, OCR, assistant, PayPal sandbox integration)</li>
        <li>Data deletion requests (see <a href="/privacy">Privacy Policy</a>)</li>
        <li>Security vulnerability reports (see <a href="/security">Security page</a>)</li>
        <li>Demo walkthrough questions</li>
      </ul>

      <h2>What we cannot help with</h2>
      <ul>
        <li>Real financial disputes (no real money involved)</li>
        <li>Real PayPal account issues (use <a href="https://www.paypal.com/support" target="_blank" rel="noopener noreferrer">PayPal support</a>)</li>
        <li>Tax, legal, or financial advice</li>
        <li>Data recovery after hackathon demo wipe</li>
      </ul>

      <h2>Data deletion requests</h2>
      <p>
        To have your session data deleted, email{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a> with subject line
        &ldquo;Data deletion request&rdquo;. Include approximate date of last use.
        Response within 7 days.
      </p>

      <h2>Accessibility</h2>
      <p>
        The app supports keyboard navigation, semantic HTML, and reduced motion. If you
        encounter an accessibility barrier, please report it to the support email above.
      </p>

      <h2>Feedback</h2>
      <p>
        Feedback on the Ethical Surplus model, parser accuracy, or UX is welcome — this is
        an active demo. Send to <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>.
      </p>
    </LegalPage>
  );
}
