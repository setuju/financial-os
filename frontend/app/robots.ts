import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/login',
          '/signup',
          '/privacy',
          '/terms',
          '/legal',
          '/security',
          '/support',
          '/reset',
        ],
        disallow: [
          '/api/',
          '/dashboard',
          '/journal',
          '/ledger',
          '/impact',
          '/horizon',
        ],
      },
    ],
    sitemap: 'https://financial.saturumah.net/sitemap.xml',
    host: 'https://financial.saturumah.net',
  };
}
