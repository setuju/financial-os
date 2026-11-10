import type { Metadata } from 'next';
import LegalPage from '@/components/landing/LegalPage';
export const metadata: Metadata = {
  title: 'Security & Privacy Settings',
  description: 'How Financial OS handles sessions, data in transit, data at rest, your controls, and how to report a vulnerability.',
  alternates: { canonical: '/security' },
};


export default function SecurityPage() {
  return (
    <LegalPage title="Security & Privacy Settings" lastUpdated="10 November 2026">
      <p>
        Financial OS is a demo app with minimal security footprint. This page explains what
        happens to your data and how you can control it.
      </p>

      <h2>Session & authentication</h2>
      <ul>
        <li>
          <strong>Session cookie:</strong> a single HttpOnly cookie (<code>fos_auth</code>)
          gates access to the app. Expires after 7 days. Secure flag enabled in production.
        </li>
        <li>
          <strong>No user accounts:</strong> there is no email, password hash, or user record
          stored. The shared password is compared server-side only.
        </li>
        <li>
          <strong>Sign out:</strong> click the logout icon in the navbar to clear the session
          cookie immediately.
        </li>
      </ul>

      <h2>Data in transit</h2>
      <ul>
        <li>All traffic to the app and API is HTTPS (TLS 1.2+ via Cloudflare / Vercel / Render)</li>
        <li>Database connections use TLS with <code>sslmode=require</code></li>
        <li>Cookies are HttpOnly and SameSite=Lax</li>
      </ul>

      <h2>Data at rest</h2>
      <ul>
        <li>Transactions, goals, and payouts live in Neon PostgreSQL (Singapore)</li>
        <li>Neon encrypts data at rest (AES-256)</li>
        <li>No files (receipts, exports) are stored on our servers</li>
      </ul>

      <h2>What we do NOT do</h2>
      <ul>
        <li>No tracking analytics (Google Analytics, Plausible, PostHog — none)</li>
        <li>No advertising identifiers</li>
        <li>No fingerprinting</li>
        <li>No third-party scripts on landing or legal pages</li>
      </ul>

      <h2>Your controls</h2>
      <ul>
        <li>
          <strong>Clear session:</strong> click logout or clear browser cookies for this site
        </li>
        <li>
          <strong>Request data deletion:</strong> email{' '}
          <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a> — response within 7 days
        </li>
        <li>
          <strong>Stop using the app:</strong> all data will be wiped between hackathon
          sessions regardless
        </li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        If you find a security issue, please report it privately to{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a> before public disclosure.
        Responsible disclosure appreciated.
      </p>

      <h2>Contact</h2>
      <p>
        Jack · Medan, Indonesia ·{' '}
        <a href="mailto:Jack@SatuRumah.net">Jack@SatuRumah.net</a>
      </p>
    </LegalPage>
  );
}
