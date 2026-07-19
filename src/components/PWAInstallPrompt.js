'use client';

import { useState, useEffect } from 'react';

// Shows a tasteful "Install App" banner at the bottom of the screen
// for the CUSTOMER app only. The admin panel has its own install button.
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed or app is already installed
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('pwa-dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return; // already installed

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds before showing banner (don't interrupt immediately)
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', '1');
  };

  if (!showBanner || dismissed || installed) return null;

  return (
    <div
      id="pwa-install-banner"
      style={{
        position: 'fixed',
        bottom: 72, // above the mobile bottom nav
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 8888,
        width: 'calc(100% - 2rem)',
        maxWidth: 420,
        background: 'linear-gradient(135deg, #0f4c75, #1a7abf)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(15,76,117,0.4)',
        animation: 'slideUp 0.35s ease-out',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: '12px',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
      }}>
        🦐
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
          Add to Home Screen
        </p>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: '2px 0 0' }}>
          Shop fresh seafood anytime, even offline!
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          id="pwa-install-btn"
          style={{
            background: 'white', color: '#0f4c75',
            border: 'none', borderRadius: '8px',
            padding: '7px 14px', fontWeight: 700,
            fontSize: '0.82rem', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          id="pwa-dismiss-btn"
          style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '7px 10px', fontSize: '0.85rem',
            cursor: 'pointer',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
