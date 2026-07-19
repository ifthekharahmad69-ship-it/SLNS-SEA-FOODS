import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const COL = 'categories';

// PATCH — update a category
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, icon, description, image } = body;
    await adminDb.collection(COL).doc(id).set(
      { name, icon, description, image, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove a custom category
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await adminDb.collection(COL).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
