// src/app/api/promo/active/route.js
// GET → Returns all active, non-expired promo codes (public — for customer display)
// Only returns safe info: code, description, type, value, minOrder

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const now = new Date().toISOString();

    const snapshot = await adminDb
      .collection('promo_codes')
      .where('active', '==', true)
      .get();

    const codes = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          code: d.code,
          type: d.type,           // 'percent' | 'flat'
          value: d.value,
          minOrder: d.minOrder || 0,
          description: d.description || (d.type === 'percent' ? `${d.value}% off` : `₹${d.value} off`),
          expiresAt: d.expiresAt || null,
          // Determine if still valid
          expired: d.expiresAt ? new Date(d.expiresAt) < new Date() : false,
          usedUp: d.maxUses > 0 && d.usedCount >= d.maxUses,
        };
      })
      // Only show codes that are still usable
      .filter((c) => !c.expired && !c.usedUp)
      // Don't expose internal fields
      .map(({ code, type, value, minOrder, description }) => ({
        code,
        type,
        value,
        minOrder,
        description,
        label: type === 'percent' ? `${value}% OFF` : `₹${value} OFF`,
      }));

    return NextResponse.json({ success: true, codes });
  } catch (err) {
    console.error('GET active promos error:', err);
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
  }
}
