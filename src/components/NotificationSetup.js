'use client';

// NotificationSetup.js
// Shows a beautiful permission banner automatically on every page visit.
// Uses native Notification API directly — works without any env vars.
// Also initializes OneSignal if NEXT_PUBLIC_ONESIGNAL_APP_ID is set.

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAILS = [
  'swamynarasimha670@gmail.com',
  'kopanathibhimaraju@gmail.com',
  'ifthekharahmad69@gmail.com',
];

let oneSignalInitialized = false;

export default function NotificationSetup() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [permStatus, setPermStatus] = useState('default'); // 'default' | 'granted' | 'denied'

  // ── Check permission & show banner ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    const perm = Notification.permission;
    setPermStatus(perm);

    // If already granted → init OneSignal silently, no banner needed
    if (perm === 'granted') {
      initOneSignal();
      return;
    }

    // If denied → don't annoy the user
    if (perm === 'denied') return;

    // Default → show our custom banner after 2 seconds
    const timer = setTimeout(() => setShowBanner(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── Initialize OneSignal (silent, background) ────────────────────────────────
  const initOneSignal = async () => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || oneSignalInitialized) return;
    try {
      const OneSignal = (await import('react-onesignal')).default;
      oneSignalInitialized = true;
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        allowLocalhostAsSecureOrigin: true,
      });
      console.log('[OneSignal] Initialized ✅');
    } catch (err) {
      console.warn('[OneSignal] Init error:', err.message);
    }
  };

  // ── Tag user in OneSignal after login ────────────────────────────────────────
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const tag = async () => {
      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) return;
      try {
        const OneSignal = (await import('react-onesignal')).default;
        await OneSignal.login(user.uid);
        const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'customer';
        await OneSignal.User.addTag('role', role);
        console.log(`[OneSignal] Tagged as ${role} ✅`);
      } catch (err) {
        console.warn('[OneSignal] Tag error:', err.message);
      }
    };
    tag();
  }, [user]);

  // ── Handle "Allow" button click ──────────────────────────────────────────────
  const handleAllow = async () => {
    setShowBanner(false);
    try {
      // Direct native browser permission request — always works
      const result = await Notification.requestPermission();
      setPermStatus(result);
      if (result === 'granted') {
        console.log('[Notifications] Permission granted ✅');
        await initOneSignal();
      }
    } catch (err) {
      console.warn('[Notifications] Request failed:', err.message);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Re-show after 5 minutes if still not decided
    setTimeout(() => {
      if (Notification.permission === 'default') setShowBanner(true);
    }, 5 * 60 * 1000);
  };

  if (!showBanner || permStatus === 'granted' || permStatus === 'denied') return null;

  return (
    <>
      <style>{`
        @keyframes notifSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>

      {/* Full-width banner at BOTTOM of screen — unmissable */}
      <div
        id="notification-permission-banner"
        style={{
          position: 'fixed',
          bottom: 70,           // above mobile bottom nav
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: 480,
          zIndex: 9990,
          background: 'linear-gradient(135deg, #0f3460, #0f4c75)',
          borderRadius: 18,
          padding: '14px 16px',
          boxShadow: '0 8px 32px rgba(15,76,117,0.55)',
          border: '1px solid rgba(255,255,255,0.12)',
          animation: 'notifSlideUp 0.4s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {/* Bell icon */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
          animation: 'bellRing 1.5s ease-in-out infinite',
        }}>
          🔔
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            color: '#fff', fontWeight: 700, fontSize: '0.88rem',
            margin: '0 0 2px', lineHeight: 1.3,
          }}>
            Get Order Alerts Instantly!
          </p>
          <p style={{
            color: 'rgba(255,255,255,0.75)', fontSize: '0.74rem',
            margin: 0, lineHeight: 1.4,
          }}>
            Know when your order is confirmed, out for delivery & delivered 📦
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleAllow}
            id="notif-allow-btn"
            style={{
              background: '#fff', color: '#0f4c75',
              border: 'none', borderRadius: 10,
              padding: '7px 14px', fontWeight: 700,
              fontSize: '0.8rem', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🔔 Allow
          </button>
          <button
            onClick={handleDismiss}
            id="notif-later-btn"
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '5px 10px', fontSize: '0.76rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Later
          </button>
        </div>
      </div>
    </>
  );
}
