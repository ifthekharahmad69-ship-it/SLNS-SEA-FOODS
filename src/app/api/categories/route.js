import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const COL = 'categories';

// GET — list all custom (Firestore) categories
export async function GET() {
  try {
    const snap = await adminDb.collection(COL).get();
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create a new custom category
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, slug, icon, description, image } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const id = slug || name.toLowerCase().replace(/\s+/g, '-');
    await adminDb.collection(COL).doc(id).set({
      name, slug: id, icon: icon || '🐟', description: description || '', image: image || '',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ id, success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
