// src/app/api/reviews/route.js
// POST → Customer submits a product review
// GET  → Admin fetches all reviews (optionally filtered by productId)

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// POST — submit a new review
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, productName, name, rating, comment, orderId } = body;

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: 'productId, name, rating and comment are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const reviewData = {
      productId: productId.trim(),
      productName: productName || '',
      name: name.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      orderId: orderId?.trim() || null,
      status: 'pending',       // 'pending' | 'approved' | 'rejected'
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('reviews').add(reviewData);
    console.log(`✅ New review: ${docRef.id} for product ${productId}`);

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (err) {
    console.error('POST review error:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// GET — fetch reviews (admin: all; public: approved only for a productId)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const adminMode = searchParams.get('admin') === '1';

    let q = adminDb.collection('reviews').orderBy('createdAt', 'desc');

    if (productId) {
      q = q.where('productId', '==', productId);
    }
    if (!adminMode) {
      // Public: only show approved reviews
      q = q.where('status', '==', 'approved');
    }

    const snapshot = await q.limit(100).get();

    const reviews = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error('GET reviews error:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
