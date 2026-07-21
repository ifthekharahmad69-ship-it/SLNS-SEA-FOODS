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

    // Fetch all reviews without requiring a Firestore composite index
    const snapshot = await adminDb.collection('reviews').get();

    let reviews = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || (typeof data.createdAt === 'string' ? data.createdAt : null),
      };
    });

    // Filter by productId if specified
    if (productId) {
      reviews = reviews.filter((r) => String(r.productId).trim() === String(productId).trim());
    }

    // Filter by status if public
    if (!adminMode) {
      reviews = reviews.filter((r) => r.status === 'approved');
    }

    // Sort by createdAt descending (newest first)
    reviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error('GET reviews error:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
