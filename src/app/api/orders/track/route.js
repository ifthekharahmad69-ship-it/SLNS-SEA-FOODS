// src/app/api/orders/track/route.js
// GET /api/orders/track?id=ORD-A3X9K
// Public endpoint — looks up order by human-readable orderId
// Uses Firebase Admin SDK so Firestore rules don't block it

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic'; // uses request.url — cannot be static

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id')?.toUpperCase().trim();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Query Firestore for the order by orderId field
    const snapshot = await adminDb
      .collection('orders')
      .where('orderId', '==', orderId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Return sanitized order data (don't expose internal doc ID or sensitive fields)
    const order = {
      docId: doc.id,
      orderId: data.orderId,
      customer: data.customer,
      phone: data.phone,
      address: data.address,
      items: data.items || [],
      subtotal: data.subtotal,
      delivery: data.delivery,
      total: data.total,
      payment: data.payment,
      status: data.status,
      utrNumber: data.utrNumber || null,
      paymentStatus: data.paymentStatus || null,
      notes: data.notes || '',
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('❌ Track order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order. Please try again.' }, { status: 500 });
  }
}
