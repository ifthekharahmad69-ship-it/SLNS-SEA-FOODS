'use client';

// NotificationSetup.js
// Synchronous User Gesture Permission Handler + OneSignal v16 Registration

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAILS = [
  'swamynarasimha670@gmail.com',
  'kopanathibhimaraju@gmail.com',
  'ifthekharahmad69@gmail.com',
];

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '85ff10cd-305a-4954-a4ed-4f40a5cc2517';

export default function NotificationSetup() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // ── Step 1: Initialize OneSignal SDK on mount ────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isAlreadyGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
    setPermissionGranted(isAlreadyGranted);

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });

        console.log('[OneSignal v16] SDK Initialized ✅');

        const isGranted = Notification?.permission === 'granted';
        setPermissionGranted(isGranted);

        if (isGranted) {
          try {
            if (OneSignal.User?.PushSubscription?.optIn) {
              await OneSignal.User.PushSubscription.optIn();
            }
          } catch (e) {
            console.warn('[OneSignal] OptIn error:', e);
          }
        } else if (Notification?.permission !== 'denied') {
          setShowBanner(true);
        }
      } catch (err) {
        console.error('[OneSignal v16] Init error:', err);
      }
    });
  }, []);

  // ── Step 2: Sync logged in user UID and admin role tags ────────────────────
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.login(user.uid);
        const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase?.()?.trim?.());
        const role = isAdmin ? 'admin' : 'customer';
        await OneSignal.User.addTag('role', role);
        console.log(`[OneSignal v16] User ${user.uid} tagged as ${role} ✅`);
      } catch (err) {
        console.error('[OneSignal v16] Tag error:', err);
      }
    });
  }, [user]);

  // ── Step 3: Direct User Gesture Permission Trigger ──────────────────────────
  const handleAllow = async () => {
    // 1. Immediately call browser native requestPermission in direct response to click
    let result = 'default';
    try {
      if (typeof Notification !== 'undefined') {
        result = await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('Native permission error:', e);
    }

    const isGranted = result === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted');
    setPermissionGranted(isGranted);
    if (isGranted) setShowBanner(false);

    // 2. Register push token & tags with OneSignal SDK
    if (typeof window !== 'undefined') {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          if (OneSignal.User?.PushSubscription?.optIn) {
            await OneSignal.User.PushSubscription.optIn();
          } else if (OneSignal.Notifications?.requestPermission) {
            await OneSignal.Notifications.requestPermission();
          }

          if (user) {
            const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase?.()?.trim?.());
            await OneSignal.User?.addTag?.('role', isAdmin ? 'admin' : 'customer');
          }
        } catch (err) {
          console.error('[OneSignal v16] Post-permission error:', err);
        }
      });
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

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
          15% { transform: rotate(15deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-10deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>

      {/* Floating Bell Button on Bottom-Left */}
      <button
        onClick={handleAllow}
        id="floating-notif-bell-btn"
        title="Enable Order Notifications"
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
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ animation: 'bellRing 1.5s ease-in-out infinite', display: 'inline-block' }}>🔔</span>
        <span>Enable Alerts</span>
      </button>

      {/* Full-width notification banner at bottom */}
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
