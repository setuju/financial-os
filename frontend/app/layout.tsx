/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/app/layout.tsx
 * │  Purpose   : Page: /layout.tsx
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  other: { google: 'notranslate' },
  metadataBase: new URL('https://financial.saturumah.net'),
  title: {
    default: 'Financial OS — Natural-language finance with ethical surplus',
    template: '%s · Financial OS',
  },
  description:
    'Track money with words. AI parser in English & Bahasa Indonesia, voice input, OCR receipts, ethical surplus cascade, and PayPal Payouts sandbox. Built for PayPal AI Hackathon 2026.',
  keywords: [
    'personal finance', 'natural language finance', 'AI finance',
    'PayPal Payouts', 'ethical surplus', 'budget tracker',
    'Bahasa Indonesia', 'OCR receipt scanner', 'Financial OS',
    'PayPal AI Hackathon',
  ],
  authors: [{ name: 'Jack', url: 'https://saturumah.net' }],
  creator: 'Jack',
  publisher: 'Financial OS',
  category: 'finance',
  alternates: {
    canonical: 'https://financial.saturumah.net',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://financial.saturumah.net',
    siteName: 'Financial OS',
    title: 'Financial OS — Natural-language finance',
    description:
      'Type or speak money. Ethical surplus → PayPal Payouts sandbox. Four AI modalities: text, voice, OCR, chat.',
    images: [{ url: '/icon.svg', width: 512, height: 512, alt: 'Financial OS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial OS — Natural-language finance',
    description:
      'Type or speak money. Ethical surplus → PayPal Payouts sandbox.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>

              <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='dark'){d.setAttribute('data-theme','dark');}else{d.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
