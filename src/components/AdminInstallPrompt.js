'use client';

import { useState, useEffect, useRef } from 'react';

// Admin floating download icon — tiny pulsing ⬇ button.
// Shows a nudge toast every 60 s until admin installs or permanently dismisses.
export default function AdminInstallPrompt() {
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

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    if (localStorage.getItem('admin-pwa-perm-dismissed')) {
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

  // Toast every 60 seconds
  useEffect(() => {
    if (installed || permanentDismiss) return;

    const firstTimer = setTimeout(() => {
      setShowToast(true);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 8000);
    }, 5000);

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
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const handleDismissToast = () => {
    setShowToast(false);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handlePermanentDismiss = () => {
    setShowToast(false);
    setPermanentDismiss(true);
    localStorage.setItem('admin-pwa-perm-dismissed', '1');
    clearInterval(intervalRef.current);
  };

  if (installed || permanentDismiss) return null;

  return (
    <>
      <style>{`
        @keyframes adminFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes adminPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(99,102,241,0.5); }
          50% { box-shadow: 0 4px 28px rgba(99,102,241,0.85), 0 0 0 8px rgba(99,102,241,0.15); }
        }
        @keyframes adminToastIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes adminIOSSlide {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Floating download icon ─────────────────────────────────── */}
      <button
        onClick={handleInstall}
        id="admin-pwa-float-btn"
        title="Install Admin App"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '16px',
          zIndex: 8800,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #312e81, #6366f1)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          animation: 'adminFloat 2.5s ease-in-out infinite, adminPulse 2.5s ease-in-out infinite',
        }}
        aria-label="Install Admin App"
      >
        ⬇
      </button>

      {/* ── Toast nudge (every 60 s) ───────────────────────────────── */}
      {showToast && (
        <div
          id="admin-pwa-toast"
          style={{
            position: 'fixed',
            bottom: '82px',
            right: '16px',
            zIndex: 8900,
            background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)',
            color: 'white',
            borderRadius: '14px',
            padding: '10px 14px',
            width: 220,
            boxShadow: '0 6px 24px rgba(99,102,241,0.45)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'adminToastIn 0.35s ease-out',
          }}
        >
          <div style={{
            position: 'absolute', bottom: -8, right: 20,
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #4f46e5',
          }} />
          <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0 0 2px' }}>
            ⚡ Install Admin App
          </p>
          <p style={{ fontSize: '0.73rem', margin: '0 0 8px', opacity: 0.85 }}>
            Instant order alerts • Quick access
          </p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleInstall}
              id="admin-pwa-toast-install-btn"
              style={{
                flex: 1, background: 'white', color: '#312e81',
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
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '5px 8px', fontSize: '0.8rem',
                cursor: 'pointer',
              }}
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

      {/* ── iOS guide sheet ────────────────────────────────────────── */}
      {showIOSGuide && (
        <>
          <div
            onClick={() => setShowIOSGuide(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9997 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#1a1a2e', borderRadius: '20px 20px 0 0',
            padding: '1.5rem', zIndex: 9998,
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            animation: 'adminIOSSlide 0.3s ease',
          }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>
              📲 Install Admin App on iPhone/iPad
            </h3>
            {[
              { step: '1', text: 'Tap the Share button (□↑) at the bottom of Safari' },
              { step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
              { step: '3', text: 'Tap "Add" — Admin App is now on your home screen!' },
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
        </>
      )}
    </>
  );
}
