'use client';

// NotificationSetup.js — OneSignal Web Push v16
// Fixes "All included players are not subscribed":
// Always ensures OneSignal.User.PushSubscription.optIn() is called when permission is granted.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAILS = [
  'swamynarasimha670@gmail.com',
  'kopanathibhimaraju@gmail.com',
  'ifthekharahmad69@gmail.com',
];

const ONESIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '85ff10cd-305a-4954-a4ed-4f40a5cc2517';

export default function NotificationSetup() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  // ── Step 1: Initialize OneSignal & auto opt-in if permission granted ──────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initialized.current) return;
    initialized.current = true;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerPath: '/sw.js',
          serviceWorkerParam: { scope: '/' },
          notifyButton: { enable: false },
        });

        console.log('[OneSignal] Initialized ✅ App:', ONESIGNAL_APP_ID.slice(0, 8));

        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
        console.log('[OneSignal] Current browser permission:', perm);

        if (perm === 'granted') {
          setPermissionGranted(true);
          setShowBanner(false);

          // CRITICAL: Always opt-in granted devices to register push token with OneSignal
          try {
            await OneSignal.User.PushSubscription.optIn();
            console.log('[OneSignal] Auto opt-in successful ✅');
          } catch (e) {
            console.warn('[OneSignal] Auto opt-in warning:', e?.message || e);
          }

          // Sync user ID & role if logged in
          if (user) {
            try {
              await OneSignal.login(user.uid);
              const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase?.()?.trim?.());
              const role = isAdmin ? 'admin' : 'customer';
              await OneSignal.User.addTag('role', role);
              console.log(`[OneSignal] User tagged as "${role}" ✅`);
            } catch (tagErr) {
              console.warn('[OneSignal] Tag error on mount:', tagErr);
            }
          }
        } else if (perm === 'default') {
          // Show prompt banner after 2s if permission not asked yet
          setTimeout(() => setShowBanner(true), 2000);
        }
      } catch (err) {
        console.error('[OneSignal] Init error:', err);
      }
    });
  }, [user]);

  // ── Step 2: Sync user login state ──────────────────────────────────────────
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          await OneSignal.login(user.uid);
          const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase?.()?.trim?.());
          const role = isAdmin ? 'admin' : 'customer';
          await OneSignal.User.addTag('role', role);
          await OneSignal.User.PushSubscription.optIn();
          console.log(`[OneSignal] User ${user.uid} logged in & tagged as "${role}" ✅`);
        }
      } catch (err) {
        console.error('[OneSignal] Login sync error:', err);
      }
    });
  }, [user]);

  // ── Step 3: Handle Allow button click ──────────────────────────────────────
  const handleAllow = async () => {
    setLoading(true);
    setShowBanner(false);

    const timeoutId = setTimeout(() => setLoading(false), 8000);

    try {
      let permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      console.log('[Notif] User permission result:', permission);

      if (permission === 'granted') {
        setPermissionGranted(true);

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal) {
          try {
            // Opt in device to get player ID / push token registered
            await OneSignal.User.PushSubscription.optIn();
            console.log('[OneSignal] Manual Push opt-in ✅');

            if (user) {
              await OneSignal.login(user.uid);
              const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase?.()?.trim?.());
              const role = isAdmin ? 'admin' : 'customer';
              await OneSignal.User.addTag('role', role);
              console.log(`[OneSignal] Tagged as "${role}" ✅`);
            }
          } catch (e) {
            console.warn('[OneSignal] optIn error:', e?.message || e);
          }
        });
      } else {
        console.warn('[Notif] Permission was not granted (state: ' + permission + ')');
      }
    } catch (err) {
      console.error('[Notif] handleAllow error:', err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleDismiss = () => setShowBanner(false);

  // If permission is granted, we don't render the banner, but the useEffect above keeps sync active
  if (permissionGranted) return null;

  return (
    <>
      <style>{`
        @keyframes notifSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          15%  { transform: rotate(15deg); }
          30%  { transform: rotate(-15deg); }
          45%  { transform: rotate(10deg); }
          60%  { transform: rotate(-10deg); }
          75%  { transform: rotate(5deg); }
        }
      `}</style>

      {/* Floating Bell button */}
      <button
        onClick={handleAllow}
        id="floating-notif-bell-btn"
        title="Enable Order Notifications"
        disabled={loading}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          zIndex: 9980,
          background: 'linear-gradient(135deg, #0f3460, #0f4c75)',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          padding: '8px 14px',
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 6px 20px rgba(15,76,117,0.5)',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: loading ? 0.7 : 1,
        }}
      >
        <span style={{ animation: 'bellRing 1.5s ease-in-out infinite', display: 'inline-block' }}>🔔</span>
        <span>{loading ? 'Enabling…' : 'Enable Alerts'}</span>
      </button>

      {/* Slide-up banner */}
      {showBanner && (
        <div
          id="notification-permission-banner"
          style={{
            position: 'fixed',
            bottom: 75,
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
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
            animation: 'bellRing 1.5s ease-in-out infinite',
          }}>
            🔔
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', margin: '0 0 2px', lineHeight: 1.3 }}>
              Get Order Alerts Instantly!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.74rem', margin: 0, lineHeight: 1.4 }}>
              Know when your order is confirmed, out for delivery & delivered 📦
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button
              onClick={handleAllow}
              id="notif-allow-btn"
              disabled={loading}
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
      )}
    </>
  );
}
