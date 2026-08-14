import './globals.css';
import 'leaflet/dist/leaflet.css';
import Script from 'next/script';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import GuestPrompt from '@/components/GuestPrompt';
import NotificationSetup from '@/components/NotificationSetup';

export const viewport = {
  themeColor: '#0f4c75',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slns-sea-foods.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SLNS Fresh Sea Foods — Premium Fish, Prawns & Crabs',
    template: '%s | SLNS Fresh Sea Foods',
  },
  description:
    'Order fresh fish, prawns, crabs, and ready-to-eat seafood dishes delivered to your door in Amalapuram. Andhra-style seafood at its finest.',
  keywords: [
    'fresh seafood',
    'fish delivery',
    'fresh prawns',
    'mud crabs',
    'seafood delivery Amalapuram',
    'Andhra seafood',
    'SLNS Fresh',
    'Amma Sea Foods',
  ],
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SLNS Fresh',
  },
  openGraph: {
    title: 'SLNS Fresh Sea Foods — Premium Seafood Delivery',
    description: 'Order fresh fish, prawns, crabs & authentic Andhra seafood dishes delivered fast.',
    url: siteUrl,
    siteName: 'SLNS Fresh Sea Foods',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'SLNS Fresh Sea Foods',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLNS Fresh Sea Foods',
    description: 'Fresh fish, prawns, crabs & seafood dishes delivered to your doorstep.',
    images: ['/images/hero-banner.jpg'],
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
      </head>
      <body>
        {/* OneSignal Web Push SDK loaded properly via next/script */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        {/* Register Service Worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
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

        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <MobileBottomNav />
              <WhatsAppFloat />
              <GuestPrompt />
              <PWAInstallPrompt />
              <NotificationSetup />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
