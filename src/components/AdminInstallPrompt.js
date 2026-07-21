'use client';

import { useState, useEffect } from 'react';

export default function AdminInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // iOS detection (Safari doesn't support beforeinstallprompt)
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS guide after 2s if not dismissed before
      if (!localStorage.getItem('admin-pwa-ios-dismissed')) {
        setTimeout(() => setShowBanner(true), 2000);
      }
      return;
    }

    // Android/Chrome/Desktop — use beforeinstallprompt
    if (localStorage.getItem('admin-pwa-dismissed')) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2000);
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
    localStorage.setItem(isIOS ? 'admin-pwa-ios-dismissed' : 'admin-pwa-dismissed', '1');
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* Backdrop for iOS guide */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9997 }}
        />
      )}

      {/* iOS Step-by-step guide */}
      {showIOSGuide && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#1a1a2e', borderRadius: '20px 20px 0 0',
          padding: '1.5rem', zIndex: 9998,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
          animation: 'slideUpAdmin 0.3s ease',
        }}>
          <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>
            📲 Install Admin App on iPhone/iPad
          </h3>
          {[
            { step: '1', text: 'Tap the Share button (□↑) at the bottom of Safari' },
            { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
            { step: '3', text: 'Tap "Add" — done! The Admin App is now on your home screen' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{step}</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
          ))}
          <button
            onClick={() => setShowIOSGuide(false)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', marginTop: '0.5rem',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Got it ✓
          </button>
        </div>
      )}

      {/* Main install banner */}
      <div style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9900,
        width: 'calc(100% - 2rem)',
        maxWidth: 480,
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'slideUpAdmin 0.35s ease-out',
      }}>
        <style>{`
          @keyframes slideUpAdmin {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: 46, height: 46, borderRadius: '12px',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          ⚙️
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', margin: 0 }}>
            Install Admin App
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.74rem', margin: '2px 0 0' }}>
            {isIOS ? 'Add to Home Screen for quick access' : 'One-click access on any device'}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall}
            id="admin-pwa-install-btn"
            style={{
              background: 'white', color: '#312e81',
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
            style={{
              background: 'rgba(255,255,255,0.15)', color: 'white',
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
