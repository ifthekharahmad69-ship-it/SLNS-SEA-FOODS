// /api/test-notification/route.js
// Hit POST /api/test-notification to send a test push to ALL subscribed devices.
// Use this to verify OneSignal is working before testing with real orders.

import { NextResponse } from 'next/server';

export async function POST() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  const restKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restKey) {
    return NextResponse.json(
      { error: 'OneSignal env vars missing', appId: !!appId, restKey: !!restKey },
      { status: 500 }
    );
  }

  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Key ${restKey.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        app_id: appId.trim(),
        included_segments: ['Subscribed Users'],
        headings: { en: '🧪 Test Notification — SLNS Fresh' },
        contents: { en: 'Push notifications are working! ✅ You will now get order alerts.' },
        url: 'https://slns-sea-foods.vercel.app',
        chrome_web_icon: 'https://slns-sea-foods.vercel.app/icons/customer-192.png',
        priority: 10,
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      success: res.ok,
      recipients: data.recipients,
      id: data.id,
      errors: data.errors,
      raw: data,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
