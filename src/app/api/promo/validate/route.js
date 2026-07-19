// src/app/api/promo/validate/route.js
// POST → Validate a promo code at checkout
// Returns discount amount or error

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const upperCode = code.toUpperCase().trim();

    // Find the promo code
    const snapshot = await adminDb
      .collection('promo_codes')
      .where('code', '==', upperCode)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const promo = doc.data();

    // Check expiry
    if (promo.expiresAt) {
      const expiry = new Date(promo.expiresAt);
      if (expiry < new Date()) {
        return NextResponse.json({ error: 'This promo code has expired' }, { status: 410 });
      }
    }

    // Check max uses
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 410 });
    }

    // Check minimum order
    const total = Number(orderTotal) || 0;
    if (promo.minOrder > 0 && total < promo.minOrder) {
      return NextResponse.json({
        error: `Minimum order of ₹${promo.minOrder} required for this code`,
      }, { status: 422 });
    }

    // Calculate discount
    let discount = 0;
    if (promo.type === 'percent') {
      discount = Math.round((total * promo.value) / 100);
    } else {
      discount = Math.min(promo.value, total); // Flat — can't exceed order total
    }

    return NextResponse.json({
      success: true,
      promoId: doc.id,
      code: upperCode,
      type: promo.type,
      value: promo.value,
      discount,
      description: promo.description || `${promo.type === 'percent' ? `${promo.value}% off` : `₹${promo.value} off`}`,
    });
  } catch (err) {
    console.error('Validate promo error:', err);
    return NextResponse.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
