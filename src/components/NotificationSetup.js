'use client';

// NotificationSetup.js
// Initializes OneSignal Web SDK on every page.
// - Prompts browser permission for push notifications
// - Links logged-in user's Firebase UID as OneSignal externalId
// - Tags admin users with role:admin
// - Renders a small floating bell button if notifications are not yet allowed

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
  const [permissionGranted, setPermissionGranted] = useState(true); // default true to avoid flash

  // ── Step 1: Initialize OneSignal ───────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;
    if (oneSignalInitialized) return;

    const init = async () => {
      try {
        const OneSignal = (await import('react-onesignal')).default;
        oneSignalInitialized = true;

        await OneSignal.init({
          appId,
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          allowLocalhostAsSecureOrigin: true,
        });

        console.log('[OneSignal] Initialized ✅');

        // Check current notification permission
        const isGranted = OneSignal.Notifications?.permission === true || Notification?.permission === 'granted';
        setPermissionGranted(isGranted);

        // Prompt automatically if default
        if (!isGranted && Notification?.permission !== 'denied') {
          setTimeout(() => {
            try {
              OneSignal.Slidedown?.promptPush?.();
            } catch (err) {
              console.warn('[OneSignal] Slidedown prompt error:', err);
            }
          }, 3000);
        }
      } catch (err) {
        console.error('[OneSignal] Init error:', err);
      }
    };

    init();
  }, []);

  // ── Step 2: Link Firebase UID & Admin Tags ─────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) return;

    const linkUser = async () => {
      try {
        const OneSignal = (await import('react-onesignal')).default;

        await OneSignal.login(user.uid);

        if (ADMIN_EMAILS.includes(user.email)) {
          await OneSignal.User.addTag('role', 'admin');
          console.log('[OneSignal] Tagged as admin ✅');
        } else {
          await OneSignal.User.addTag('role', 'customer');
          console.log('[OneSignal] Tagged as customer ✅');
        }
      } catch (err) {
        console.error('[OneSignal] User link error:', err);
      }
    };

    linkUser();
  }, [user]);

  const handleEnableNotifications = async () => {
    try {
      const OneSignal = (await import('react-onesignal')).default;
      await OneSignal.Notifications?.requestPermission();
      const isGranted = Notification?.permission === 'granted';
      setPermissionGranted(isGranted);
    } catch (err) {
      console.error('[OneSignal] Request permission error:', err);
    }
  };

  // If permission is already granted, show nothing
  if (permissionGranted) return null;

  return (
    <button
      onClick={handleEnableNotifications}
      id="enable-notifications-btn"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '20px',
        zIndex: 999,
        background: '#0f4c75',
        color: '#ffffff',
        border: 'none',
        borderRadius: '24px',
        padding: '10px 16px',
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>🔔</span>
      <span>Enable Live Alerts</span>
    </button>
  );
}
