import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { products as staticProducts } from '@/data/products';

// GET /api/products/[id] — fetch a single product
// Priority: products_new → product_overrides merged with static → static fallback
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // 1. Check products_new first (admin-created products)
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      return NextResponse.json({ product: { id: newDoc.id, isNew: true, ...newDoc.data() } });
    }

    // 2. Find in static products
    const staticProduct = staticProducts.find((p) => String(p.id) === String(id));

    // 3. Check for a Firestore override for this static product
    const overrideDoc = await adminDb.collection('product_overrides').doc(id).get();

    if (overrideDoc.exists) {
      const override = overrideDoc.data();
      // If admin deleted this static product (marked _deleted), return 404
      if (override._deleted) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      if (staticProduct) {
        // Merge static + override (override wins)
        return NextResponse.json({ product: { ...staticProduct, id, ...override } });
      }
      // Override without static base — return it as-is
      return NextResponse.json({ product: { id, ...override } });
    }

    // 4. Return pure static product if found
    if (staticProduct) {
      return NextResponse.json({ product: staticProduct });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (err) {
    console.error('GET /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/products/[id] — update a product
// For admin-created products (products_new): updates the document directly
// For static products: saves overrides in product_overrides
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const update = { updatedAt: FieldValue.serverTimestamp() };
    if (typeof body.inStock === 'boolean') update.inStock = body.inStock;
    if (body.price !== undefined) update.price = Number(body.price);
    if (body.originalPrice !== undefined) update.originalPrice = Number(body.originalPrice);
    if (body.name !== undefined) update.name = body.name.trim ? body.name.trim() : body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.image !== undefined) update.image = body.image;
    if (body.category !== undefined) update.category = body.category;
    if (body.type !== undefined) update.type = body.type;
    if (body.unit !== undefined) update.unit = body.unit;
    if (body.weight !== undefined) update.weight = body.weight;
    // Always clear _deleted when updating
    update._deleted = false;

    // Check if this is an admin-created product (in products_new collection)
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      await adminDb.collection('products_new').doc(id).update(update);
    } else {
      // Static product — save override (partial update, doesn't wipe other fields)
      await adminDb.collection('product_overrides').doc(id).set(update, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/products/[id] — full replace of a product (admin-created only)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, price, originalPrice, category, type, description, image, unit, weight, inStock } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Name, price and category are required' }, { status: 400 });
    }

    const update = {
      name: name.trim(),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      category,
      type: type || 'raw',
      description: description || '',
      image: image || '',
      unit: unit || 'per kg',
      weight: weight || '1 kg',
      inStock: inStock !== false,
      _deleted: false,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Check if this is an admin-created product
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      await adminDb.collection('products_new').doc(id).set(update, { merge: false });
    } else {
      // For static products, save as override
      await adminDb.collection('product_overrides').doc(id).set(update, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete a product
// For admin-created products: deletes from products_new
// For static products: marks with _deleted: true in product_overrides (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Try deleting from products_new first (hard delete)
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      await adminDb.collection('products_new').doc(id).delete();
      return NextResponse.json({ success: true, deleted: 'new_product' });
    }

    // For static products — soft delete via _deleted flag in override
    // This ensures the Firestore onSnapshot listener in useProducts will
    // filter it out with: .filter((p) => !p._deleted)
    await adminDb.collection('product_overrides').doc(id).set(
      { _deleted: true, deletedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json({ success: true, deleted: 'static_product_soft_deleted' });
  } catch (err) {
    console.error('DELETE /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
