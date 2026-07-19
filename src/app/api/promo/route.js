// src/app/api/promo/route.js
// GET  → List all promo codes (admin)
// POST → Create a new promo code (admin)
// DELETE → Delete a promo code (admin)

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET — list all promo codes
export async function GET() {
  try {
    const snapshot = await adminDb.collection('promo_codes').orderBy('createdAt', 'desc').get();
    const codes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    return NextResponse.json({ success: true, codes });
  } catch (err) {
    console.error('GET promo error:', err);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST — create a new promo code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, type, value, minOrder, maxUses, expiresAt, description } = body;

    if (!code || !type || !value) {
      return NextResponse.json({ error: 'code, type and value are required' }, { status: 400 });
    }

    // Check for duplicates
    const existing = await adminDb.collection('promo_codes').where('code', '==', code.toUpperCase()).get();
    if (!existing.empty) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }

    const data = {
      code: code.toUpperCase().trim(),
      type,              // 'percent' | 'flat'
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      maxUses: Number(maxUses) || 0,     // 0 = unlimited
      usedCount: 0,
      expiresAt: expiresAt || null,
      description: description || '',
      active: true,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('promo_codes').add(data);
    return NextResponse.json({ success: true, id: docRef.id, code: data.code }, { status: 201 });
  } catch (err) {
    console.error('POST promo error:', err);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}

// DELETE — delete a promo code
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await adminDb.collection('promo_codes').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
