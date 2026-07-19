import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// PATCH /api/products/[id] — update price or stock for any product
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const update = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.inStock === 'boolean') update.inStock = body.inStock;
    if (body.price !== undefined) update.price = Number(body.price);
    if (body.originalPrice !== undefined) update.originalPrice = Number(body.originalPrice);
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.image !== undefined) update.image = body.image;

    // Use merge: true so partial updates don't wipe other fields
    await adminDb.collection('product_overrides').doc(id).set(update, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — only works for admin-created (new) products
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await adminDb.collection('products_new').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
