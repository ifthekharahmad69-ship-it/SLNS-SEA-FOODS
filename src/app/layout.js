import './globals.css';
import 'leaflet/dist/leaflet.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const viewport = {
  themeColor: '#0f4c75',
};

export const metadata = {
  title: 'SLNS Fresh Sea Foods — Premium Fish, Prawns & Crabs',
  description:
    'Order fresh fish, prawns, crabs, and ready-to-eat seafood dishes delivered to your door. Andhra-style seafood at its finest.',
  keywords: 'fresh seafood, fish, prawns, crabs, seafood delivery, Andhra seafood',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SLNS Fresh',
  },
  openGraph: {
    title: 'SLNS Fresh Sea Foods',
    description: 'Premium fresh seafood & dishes delivered to your door.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Apple PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SLNS Fresh" />
        <link rel="apple-touch-icon" href="/icons/customer-192.png" />
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[PWA] SW registered:', reg.scope); })
                    .catch(function(err) { console.warn('[PWA] SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <MobileBottomNav />
              <WhatsAppFloat />
              <PWAInstallPrompt />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
