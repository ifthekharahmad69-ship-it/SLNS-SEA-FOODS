// src/app/admin/layout.js
// Nested layout for /admin — overrides manifest to use the admin PWA manifest
// This lets the admin panel be installed as a SEPARATE app from the customer store

export const metadata = {
  title: 'Amma Admin Panel — SLNS Fresh Sea Foods',
  description: 'Manage orders, products, and customers for SLNS Fresh Sea Foods.',
  manifest: '/admin-manifest.json',  // ← The KEY line: admin gets its own PWA manifest
  themeColor: '#0d1117',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Amma Admin',
  },
};

export default function AdminLayout({ children }) {
  // Just pass children through — the root layout provides <html>, <body>, providers
  // This layout only overrides the metadata (manifest)
  return children;
}
