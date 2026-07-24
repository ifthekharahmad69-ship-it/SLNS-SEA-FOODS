import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { products as staticProducts } from '@/data/products';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/products — merged static products + Firestore overrides + new products
export async function GET() {
  try {
    // Fetch overrides (price/stock/image changes for static products) and new products
    const [overridesSnap, newProductsSnap] = await Promise.all([
      adminDb.collection('product_overrides').get(),
      adminDb.collection('products_new').get(),
    ]);

    const overrides = {};
    overridesSnap.forEach((doc) => {
      overrides[doc.id] = doc.data();
    });

    const newProducts = [];
    newProductsSnap.forEach((doc) => {
      const data = doc.data();
      // Exclude soft-deleted new products
      if (!data._deleted) {
        newProducts.push({ id: doc.id, isNew: true, ...data });
      }
    });

    // Sort new products newest first in memory (no index needed)
    newProducts.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?._seconds * 1000 || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?._seconds * 1000 || 0;
      return tb - ta;
    });

    // Merge static products with their overrides, filter out soft-deleted ones
    const merged = staticProducts
      .map((p) => ({ ...p, ...(overrides[p.id] || {}) }))
      .filter((p) => !p._deleted);

    return NextResponse.json({ products: [...merged, ...newProducts] });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products — add a brand new product (admin only)
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { name, price, originalPrice, category, type, description, image, unit, weight } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json({ error: 'A valid price is required' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const docRef = await adminDb.collection('products_new').add({
      name: String(name).trim(),
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
