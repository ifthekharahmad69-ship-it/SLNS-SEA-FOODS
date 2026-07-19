// src/app/api/orders/[id]/route.js
// GET   → Fetch a single order by orderId (for Track page)
// PATCH → Update order status OR save UTR payment reference

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const VALID_STATUSES = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];

// GET /api/orders/[id] — Get a single order by human-readable orderId (e.g. ORD-A3X9K)
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Query by orderId field (not doc ID)
    const snapshot = await adminDb
      .collection('orders')
      .where('orderId', '==', id.toUpperCase().trim())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const order = {
      docId: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    };

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order.' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — Update order status and/or save UTR payment reference
export async function PATCH(request, { params }) {
  try {
    const { id } = params; // Firestore doc ID
    const body = await request.json();
    const { status, utrNumber, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Doc ID is required' }, { status: 400 });
    }

    const update = { updatedAt: FieldValue.serverTimestamp() };

    // Status update (from admin panel)
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      update.status = status;
    }

    // UTR / UPI transaction reference (from customer after QR payment)
    if (utrNumber !== undefined) {
      update.utrNumber = utrNumber.trim();
      update.paymentStatus = 'paid'; // customer claims they've paid
    }

    // Payment status override (e.g. admin marks as verified)
    if (paymentStatus !== undefined) {
      update.paymentStatus = paymentStatus;
    }

    await adminDb.collection('orders').doc(id).update(update);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order.' }, { status: 500 });
  }
}
