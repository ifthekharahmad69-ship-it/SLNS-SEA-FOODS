'use client';

import { useState, useEffect } from 'react';

// Shows a tasteful "Install App" banner at the bottom of the screen
// for the CUSTOMER app only. Works on Chrome/Android AND iOS Safari.
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // iOS Safari detection
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      if (!localStorage.getItem('pwa-ios-dismissed')) {
        setTimeout(() => setShowBanner(true), 4000);
      }
      return;
    }

    // Chrome/Android/Desktop
    if (localStorage.getItem('pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1');
  };

  if (!showBanner || dismissed || installed) return null;

  return (
    <>
      {/* iOS guide backdrop */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9997 }}
        />
      )}

      {/* iOS step-by-step guide sheet */}
      {showIOSGuide && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-card, white)', borderRadius: '20px 20px 0 0',
          padding: '1.5rem 1.5rem 2rem', zIndex: 9998,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          animation: 'slideUpIOS 0.3s ease',
        }}>
          <style>{`
            @keyframes slideUpIOS {
              from { opacity: 0; transform: translateY(30px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            📲 Install SLNS Fresh on iPhone/iPad
          </h3>
          {[
            { step: '1', icon: '⬆️', text: 'Tap the Share button at the bottom of Safari' },
            { step: '2', icon: '➕', text: 'Scroll down and tap "Add to Home Screen"' },
            { step: '3', icon: '✅', text: 'Tap "Add" — the app appears on your Home Screen!' },
          ].map(({ step, icon, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent, #0f4c75), #1a7abf)',
                color: 'white', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{step}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                {icon} {text}
              </p>
            </div>
          ))}
          <button
            onClick={() => setShowIOSGuide(false)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', marginTop: '0.5rem',
              background: 'var(--accent, #0f4c75)', color: 'white',
              border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Got it ✓
          </button>
        </div>
      )}

      {/* Main install banner */}
      <div
        id="pwa-install-banner"
        style={{
          position: 'fixed',
          bottom: 80, // above the mobile bottom nav
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
            {isIOS ? 'Install the app for quick access!' : 'Shop fresh seafood anytime, even offline!'}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall}
            id="pwa-install-btn"
            style={{
              background: 'white', color: '#0f4c75',
              border: 'none', borderRadius: '8px',
              padding: '7px 14px', fontWeight: 700,
              fontSize: '0.82rem', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {isIOS ? 'How To' : 'Install'}
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
    </>
  );
}

