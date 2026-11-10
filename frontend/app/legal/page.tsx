import LegalPage from '@/components/landing/LegalPage';

export default function LegalPageRoute() {
  return (
    <LegalPage title="Legal & Disclosures" lastUpdated="10 November 2026">
      <h2>License</h2>
      <p>
        Financial OS is released under the <strong>MIT License</strong>. You may use, copy,
        modify, merge, publish, distribute, sublicense, and sell copies of the software,
        provided the original copyright notice and this permission notice are included.
      </p>
      <p>
        Full license text:{' '}
        <a href="https://github.com/setuju/financial-os/blob/main/LICENSE">LICENSE</a>
      </p>

      <h2>PayPal Sandbox Disclosure</h2>
      <p>
        All PayPal Payouts integrations in this app operate against the PayPal <strong>Sandbox</strong>.
        No funds are transferred. The batch IDs shown are simulated.
      </p>

      <h2>AI-generated content</h2>
      <p>
        The Anti-Budget Parser, OCR receipt scanner, and scoped AI Assistant use machine
        learning models. Outputs may be incorrect. Always review extracted values before
        saving.
      </p>

      <h2>No regulatory claims</h2>
      <p>
        Financial OS is not a registered financial service, money service business,
        payment institution, or fund distributor in any jurisdiction. It is not affiliated
        with or endorsed by PayPal Inc. beyond use of their public developer APIs.
      </p>

      <h2>Tax treatment</h2>
      <p>
        No tax advice is provided. Donations in this demo do not qualify as tax-deductible
        contributions. If you plan to deploy a real version of this model, consult a tax
        professional in your jurisdiction.
      </p>

      <h2>Trademarks</h2>
      <ul>
        <li>PayPal and the PayPal logo are trademarks of PayPal, Inc.</li>
        <li>Bryntum is a trademark of Bryntum AB.</li>
        <li>Next.js is a trademark of Vercel, Inc.</li>
        <li>Elastic and Elasticsearch are trademarks of Elastic N.V.</li>
        <li>Google Gemini is a trademark of Google LLC.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Legal inquiries: Jack ·{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a> · Medan, Indonesia
      </p>
    </LegalPage>
  );
}
