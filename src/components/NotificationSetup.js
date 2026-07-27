'use client';

// NotificationSetup.js
// Initializes OneSignal Web SDK on every page.
// - Asks browser permission (shows "Allow notifications?" popup)
// - Links logged-in user's Firebase UID as OneSignal externalId (for targeted pushes)
// - Tags admin users with role:admin (for admin broadcast pushes)
// This component renders nothing — purely invisible background logic.

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAILS = [
  'swamynarasimha670@gmail.com',
  'kopanathibhimaraju@gmail.com',
  'ifthekharahmad69@gmail.com',
];

let oneSignalInitialized = false; // prevent double-init on hot reload

export default function NotificationSetup() {
  const { user } = useAuth();

  // ── Step 1: Initialize OneSignal once ──────────────────────────────────────
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
          notifyButton: { enable: false }, // we use the slidedown prompt instead
          promptOptions: {
            slidedown: {
              prompts: [
                {
                  type: 'push',
                  autoPrompt: true,
                  delay: {
                    timeDelay: 8,    // show after 8 seconds on page
                    pageViews: 1,    // only after 1 page view
                  },
                  text: {
                    actionMessage:
                      '🔔 Get notified about your seafood orders — delivery updates & confirmations!',
                    acceptButton: 'Allow',
                    cancelButton: 'No thanks',
                  },
                },
              ],
            },
          },
        });

        console.log('[OneSignal] Initialized ✅');
      } catch (err) {
        console.error('[OneSignal] Init error:', err);
      }
    };

    init();
  }, []);

  // ── Step 2: Link Firebase UID as OneSignal externalId when user logs in ─────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) return;

    const linkUser = async () => {
      try {
        const OneSignal = (await import('react-onesignal')).default;

        // Set this user's Firebase UID as OneSignal external ID
        // This lets us send pushes to THIS specific user (e.g. order status updates)
        await OneSignal.login(user.uid);

        // Tag admin users so we can broadcast to all admins at once
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

  return null; // This component has no UI
}
