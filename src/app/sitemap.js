// src/app/sitemap.js
// Dynamically generates sitemap.xml for Google crawlers
// Accessible at: /sitemap.xml

import { products } from '@/data/products';

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slnsfresh.vercel.app';

  const now = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: baseUrl,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/shop/fish`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/shop/prawns`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/shop/crabs`,    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/shop/dishes`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${baseUrl}/track`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/map`,           lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cart`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Dynamic product pages
  const productPages = products
    .filter((p) => p.inStock)
    .map((p) => ({
      url: `${baseUrl}/product/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticPages, ...productPages];
}
