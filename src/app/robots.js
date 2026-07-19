// src/app/robots.js
// Generates robots.txt — tells Google which pages to crawl / ignore

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slnsfresh.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',        // Don't index admin panel
          '/api/',         // Don't index API routes
          '/login',        // Don't index login page
          '/checkout',     // Don't index checkout
          '/cart',         // Don't index cart
          '/account',      // Don't index personal account
          '/offline',      // Don't index offline fallback
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
