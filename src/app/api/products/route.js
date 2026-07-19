import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { products as staticProducts } from '@/data/products';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/products — merged static products + Firestore overrides + new products
export async function GET() {
  try {
    // Fetch overrides (price/stock changes for static products)
    const [overridesSnap, newProductsSnap] = await Promise.all([
      adminDb.collection('product_overrides').get(),
      adminDb.collection('products_new').orderBy('createdAt', 'desc').get(),
    ]);

    const overrides = {};
    overridesSnap.forEach((doc) => {
      overrides[doc.id] = doc.data();
    });

    const newProducts = [];
    newProductsSnap.forEach((doc) => {
      newProducts.push({ id: doc.id, isNew: true, ...doc.data() });
    });

    // Merge static products with their overrides
    const merged = staticProducts.map((p) => ({
      ...p,
      ...(overrides[p.id] || {}),
    }));

    return NextResponse.json({ products: [...merged, ...newProducts] });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products — add a brand new product (admin only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, price, originalPrice, category, type, description, image, unit, weight } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Name, price and category are required' }, { status: 400 });
    }

    const docRef = await adminDb.collection('products_new').add({
      name: name.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      category,
      type: type || 'raw',
      description: description || '',
      image: image || '',
      unit: unit || 'per kg',
      weight: weight || '1 kg',
      inStock: true,
      isFeatured: false,
      tags: [],
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, success: true }, { status: 201 });
  } catch (err) {
    console.error('POST /api/products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
