// src/app/api/orders/route.js
// POST  → Create a new order (called from Checkout page)
// GET   → List all orders (called from Admin panel)

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Generate a short human-readable order ID: ORD-A3X9K
function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  let id = 'ORD-';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// POST /api/orders — Place a new order
export async function POST(request) {
  try {
    const body = await request.json();

    const { name, phone, email, address, city, pincode, notes, payment, items, subtotal, delivery, total, userId } = body;

    // Basic server-side validation
    if (!name || !phone || !address || !city || !pincode || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = generateOrderId();

    const orderData = {
      orderId,
      customer: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      address: {
        full: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
      },
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        image: i.image || '',
      })),
      subtotal: Number(subtotal) || 0,
      delivery: Number(delivery) || 0,
      total: Number(total) || 0,
      payment: payment || 'cod',
      notes: notes?.trim() || '',
      userId: userId || null,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Save to Firestore (auto-generated doc ID, human-readable orderId stored inside)
    const docRef = await adminDb.collection('orders').add(orderData);

    console.log(`✅ New order created: ${orderId} (doc: ${docRef.id})`);

    return NextResponse.json({ success: true, orderId, docId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}

// GET /api/orders — Fetch all orders (for Admin panel)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');

    let query = adminDb.collection('orders').orderBy('createdAt', 'desc').limit(limitParam);
    if (userId) {
      query = adminDb.collection('orders').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limitParam);
    }
    const snapshot = await query.get();

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        docId: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings for JSON serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}
