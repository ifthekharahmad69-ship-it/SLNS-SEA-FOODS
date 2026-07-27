// src/lib/onesignal.js
// Server-side OneSignal helper — sends push notifications via REST API
// Called from /api/orders (new order alert to admin)
// and /api/orders/[id] (status update alert to customer)

const SITE_URL = 'https://slns-sea-foods.vercel.app';
const ICON_URL = `${SITE_URL}/icons/customer-192.png`;

async function sendNotification(payload) {
  // Read env vars dynamically on every call — critical for Vercel serverless functions!
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restKey) {
    console.warn(`[OneSignal] Missing APP_ID (${appId ? 'OK' : 'MISSING'}) or REST_KEY (${restKey ? 'OK' : 'MISSING'}) in environment variables — skipping push`);
    return null;
  }

  try {
    console.log(`[OneSignal] Sending push notification with App ID: ${appId.slice(0, 8)}...`);

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Key ${restKey.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        app_id: appId.trim(),
        target_channel: 'push',
        ...payload,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[OneSignal] API error response:', JSON.stringify(data));
    } else {
      console.log(`[OneSignal] Push notification sent successfully! ✅ id=${data.id} recipients=${data.recipients}`);
    }
    return data;
  } catch (err) {
    // Never let notification failure break the main request
    console.error('[OneSignal] Fetch failed:', err.message);
    return null;
  }
}

// ── Send push to ALL admin-tagged devices & Subscribed Users ──────────────────
export async function notifyAdmins({ title, body, url = `${SITE_URL}/admin` }) {
  // Try sending to role: admin tag first, fallback to Subscribed Users segment so admins never miss orders
  return sendNotification({
    filters: [
      { field: 'tag', key: 'role', relation: '=', value: 'admin' },
    ],
    included_segments: ['Subscribed Users'], // Target all subscribed admin/user devices so no order is missed!
    headings: { en: title },
    contents: { en: body },
    url,
    chrome_web_icon: ICON_URL,
    firefox_icon: ICON_URL,
    chrome_web_badge: ICON_URL,
    priority: 10,
  });
}

// ── Send push to a specific customer by Firebase UID ─────────────────────────
export async function notifyUser({ userId, title, body, url = `${SITE_URL}/track` }) {
  if (!userId) {
    console.warn('[OneSignal] notifyUser called without userId — targeting All Subscribed Users');
    return sendNotification({
      included_segments: ['Subscribed Users'],
      headings: { en: title },
      contents: { en: body },
      url,
      chrome_web_icon: ICON_URL,
      firefox_icon: ICON_URL,
      priority: 10,
    });
  }

  return sendNotification({
    include_aliases: {
      external_id: [userId],
    },
    include_external_user_ids: [userId], // backward compatibility
    headings: { en: title },
    contents: { en: body },
    url,
    chrome_web_icon: ICON_URL,
    firefox_icon: ICON_URL,
    priority: 10,
  });
}

// ── Status → Human-readable message map ──────────────────────────────────────
export function getStatusNotification(status, orderId) {
  const messages = {
    confirmed: {
      title: '✅ Order Confirmed!',
      body: `Your order ${orderId} has been confirmed and is being prepared.`,
    },
    out_for_delivery: {
      title: '🏍️ Out for Delivery!',
      body: `${orderId} is on the way! Your fresh seafood will arrive soon.`,
    },
    delivered: {
      title: '📦 Order Delivered!',
      body: `${orderId} has been delivered. Enjoy your SLNS Fresh seafood! 🦐`,
    },
    cancelled: {
      title: '❌ Order Cancelled',
      body: `Your order ${orderId} has been cancelled. Contact us for help.`,
    },
  };
  return messages[status] || null;
}
