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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slnsseafoodsandpickles.in';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SLNS Sea Foods & Pickles — Fresh Fish, Prawns, Crabs & Andhra Pickles',
    template: '%s | SLNS Sea Foods & Pickles',
  },
  description:
    'Order fresh fish, prawns, mud crabs, non-veg pickles, and authentic Andhra seafood dishes online. Fast delivery in Amalapuram & nearby.',
  keywords: [
    'SLNS',
    'SLNS Sea Foods',
    'SLNS Sea Foods and Pickles',
    'SLNS Pickles',
    'fresh seafood',
    'fish delivery',
    'fresh prawns',
    'mud crabs',
    'seafood pickles',
    'prawn pickle',
    'fish pickle',
    'seafood delivery Amalapuram',
    'Andhra seafood',
    'SLNS Fresh',
    'Amma Sea Foods',
  ],
  icons: {
    icon: '/icons/customer-192.png',
    apple: '/icons/customer-192.png',
  },
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
    title: 'SLNS Sea Foods & Pickles — Fresh Seafood & Pickles Delivery',
    description: 'Order fresh fish, prawns, crabs, non-veg pickles & authentic Andhra seafood dishes delivered fast in Amalapuram.',
    url: siteUrl,
    siteName: 'SLNS Sea Foods & Pickles',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'SLNS Sea Foods & Pickles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLNS Sea Foods & Pickles',
    description: 'Fresh fish, prawns, crabs, pickles & seafood dishes delivered to your doorstep in Amalapuram.',
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
