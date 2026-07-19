// src/app/api/reviews/[id]/route.js
// PATCH → Admin approves or rejects a review
// DELETE → Admin deletes a review

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// PATCH — update review status (approve / reject)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'approved' | 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await adminDb.collection('reviews').doc(id).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH review error:', err);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// DELETE — remove a review permanently
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await adminDb.collection('reviews').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE review error:', err);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
