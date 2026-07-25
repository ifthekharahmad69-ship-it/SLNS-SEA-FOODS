import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { products as staticProducts } from '@/data/products';
import { cloudinaryDelete, extractPublicId } from '@/lib/cloudinary';

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
// Supports image replacement — deletes old Cloudinary image when new one is provided.
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
    if (body.category !== undefined) update.category = body.category;
    if (body.type !== undefined) update.type = body.type;
    if (body.unit !== undefined) update.unit = body.unit;
    if (body.weight !== undefined) update.weight = body.weight;
    // Always clear _deleted flag on update
    update._deleted = false;

    // Image update — delete old Cloudinary image if a new one is provided
    if (body.image !== undefined) {
      update.image = body.image;
      update.images = body.image ? [body.image] : [];

      if (body.cloudinary_public_id !== undefined) {
        // If we have the old public_id explicitly, delete it
        if (body.old_cloudinary_public_id) {
          await cloudinaryDelete(body.old_cloudinary_public_id);
        }
        update.cloudinary_public_id = body.cloudinary_public_id || null;
      }
    }

    // Check if this is an admin-created product (in products_new collection)
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      // If replacing image, try to delete old one from Cloudinary
      if (body.image !== undefined && !body.old_cloudinary_public_id) {
        const oldPublicId = newDoc.data().cloudinary_public_id;
        if (oldPublicId && body.image !== newDoc.data().image) {
          await cloudinaryDelete(oldPublicId);
        }
      }
      await adminDb.collection('products_new').doc(id).update(update);
    } else {
      // Static product — check for existing override to get old public_id
      if (body.image !== undefined && !body.old_cloudinary_public_id) {
        const overrideDoc = await adminDb.collection('product_overrides').doc(id).get();
        if (overrideDoc.exists) {
          const oldPublicId = overrideDoc.data().cloudinary_public_id;
          if (oldPublicId && body.image !== overrideDoc.data().image) {
            await cloudinaryDelete(oldPublicId);
          }
        }
      }
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
    const { name, price, originalPrice, category, type, description, image, cloudinary_public_id, unit, weight, inStock } = body;

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
      cloudinary_public_id: cloudinary_public_id || null,
      unit: unit || 'per kg',
      weight: weight || '1 kg',
      inStock: inStock !== false,
      _deleted: false,
      updatedAt: FieldValue.serverTimestamp(),
    };

    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      // Delete old Cloudinary image if image is being replaced
      const oldPublicId = newDoc.data().cloudinary_public_id;
      if (oldPublicId && image && image !== newDoc.data().image) {
        await cloudinaryDelete(oldPublicId);
      }
      await adminDb.collection('products_new').doc(id).set(update, { merge: false });
    } else {
      // Static product override
      const overrideDoc = await adminDb.collection('product_overrides').doc(id).get();
      if (overrideDoc.exists) {
        const oldPublicId = overrideDoc.data().cloudinary_public_id;
        if (oldPublicId && image && image !== overrideDoc.data().image) {
          await cloudinaryDelete(oldPublicId);
        }
      }
      await adminDb.collection('product_overrides').doc(id).set(update, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] — delete a product and its Cloudinary image
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Try deleting from products_new first (hard delete)
    const newDoc = await adminDb.collection('products_new').doc(id).get();
    if (newDoc.exists) {
      // Delete Cloudinary image
      const publicId = newDoc.data().cloudinary_public_id
        || extractPublicId(newDoc.data().image);
      await cloudinaryDelete(publicId);

      await adminDb.collection('products_new').doc(id).delete();
      return NextResponse.json({ success: true, deleted: 'new_product' });
    }

    // For static products — soft delete via _deleted flag
    // Also delete Cloudinary image if one was uploaded as override
    const overrideDoc = await adminDb.collection('product_overrides').doc(id).get();
    if (overrideDoc.exists) {
      const publicId = overrideDoc.data().cloudinary_public_id
        || extractPublicId(overrideDoc.data().image);
      await cloudinaryDelete(publicId);
    }

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
