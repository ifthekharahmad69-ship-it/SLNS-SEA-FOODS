'use client';

import { useState, useEffect, useRef } from 'react';

// Floating download icon — shows a small pulsing ⬇ button.
// Every 60 seconds a mini toast nudges the user to install the app.
// Once installed (or dismissed permanently), the button disappears.
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [permanentDismiss, setPermanentDismiss] = useState(false);
  const toastTimerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Already installed as standalone — hide everything
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Permanently dismissed by user
    if (localStorage.getItem('pwa-perm-dismissed')) {
      setPermanentDismiss(true);
      return;
    }

    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    if (!ios) {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('appinstalled', () => {
        setInstalled(true);
        setShowToast(false);
      });
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  // Show toast every 60 seconds while not installed/dismissed
  useEffect(() => {
    if (installed || permanentDismiss) return;

    // First toast after 5 seconds
    const firstTimer = setTimeout(() => {
      setShowToast(true);
      // Auto-hide toast after 8 seconds
      toastTimerRef.current = setTimeout(() => setShowToast(false), 8000);
    }, 5000);

    // Repeat every 60 seconds
    intervalRef.current = setInterval(() => {
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 8000);
    }, 60000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [installed, permanentDismiss]);

  const handleInstall = async () => {
    setShowToast(false);
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismissToast = () => {
    setShowToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handlePermanentDismiss = () => {
    setShowToast(false);
    setPermanentDismiss(true);
    localStorage.setItem('pwa-perm-dismissed', '1');
    clearInterval(intervalRef.current);
  };

  if (installed || permanentDismiss) return null;

  return (
    <>
      <style>{`
        @keyframes pwaFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pwaPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(15,76,117,0.5); }
          50% { box-shadow: 0 4px 28px rgba(15,76,117,0.85), 0 0 0 8px rgba(15,76,117,0.15); }
        }
        @keyframes pwaToastIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pwaIOSSlide {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Floating download icon ─────────────────────────── */}
      <button
        onClick={handleInstall}
        id="pwa-float-btn"
        title="Install App for better experience"
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '16px',
          zIndex: 8800,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f4c75, #1a7abf)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          animation: 'pwaFloat 2.5s ease-in-out infinite, pwaPulse 2.5s ease-in-out infinite',
        }}
        aria-label="Install App"
      >
        ⬇
      </button>

      {/* ── Toast nudge (every 60 s) ─────────────────────── */}
      {showToast && (
        <div
          id="pwa-toast"
          style={{
            position: 'fixed',
            bottom: '150px',
            left: '16px',
            zIndex: 8900,
            background: 'linear-gradient(135deg, #0f4c75, #1a7abf)',
            color: 'white',
            borderRadius: '14px',
            padding: '10px 14px',
            width: 220,
            boxShadow: '0 6px 24px rgba(15,76,117,0.45)',
            animation: 'pwaToastIn 0.35s ease-out',
          }}
        >
          {/* Arrow pointing DOWN to the button below on the left */}
          <div style={{
            position: 'absolute', bottom: -8, left: 20,
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #1a7abf',
          }} />

          <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0 0 2px' }}>
            📲 Install for Better Experience!
          </p>
          <p style={{ fontSize: '0.73rem', margin: '0 0 8px', opacity: 0.85 }}>
            Faster access • Offline mode • Fresh alerts
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleInstall}
              id="pwa-toast-install-btn"
              style={{
                flex: 1, background: 'white', color: '#0f4c75',
                border: 'none', borderRadius: '8px',
                padding: '5px 0', fontWeight: 700,
                fontSize: '0.76rem', cursor: 'pointer',
              }}
            >
              {isIOS ? 'How To' : 'Install ⬇'}
            </button>
            <button
              onClick={handleDismissToast}
              style={{
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '5px 8px', fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              title="Remind me later"
            >
              Later
            </button>
            <button
              onClick={handlePermanentDismiss}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                border: 'none', padding: '5px 4px',
                fontSize: '0.75rem', cursor: 'pointer',
              }}
              title="Never show again"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── iOS step-by-step guide sheet ──────────────────────────── */}
      {showIOSGuide && (
        <>
          <div
            onClick={() => setShowIOSGuide(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9997 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--bg-card, white)', borderRadius: '20px 20px 0 0',
            padding: '1.5rem 1.5rem 2rem', zIndex: 9998,
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            animation: 'pwaIOSSlide 0.3s ease',
          }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--text-primary, #111)' }}>
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
                  background: 'linear-gradient(135deg, #0f4c75, #1a7abf)',
                  color: 'white', fontWeight: 700, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{step}</div>
                <p style={{ color: 'var(--text-secondary, #555)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                  {icon} {text}
                </p>
              </div>
            ))}
            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', marginTop: '0.5rem',
                background: '#0f4c75', color: 'white',
                border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Got it ✓
            </button>
          </div>
        </>
      )}
    </>
  );
}
