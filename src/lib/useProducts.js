'use client';

/**
 * useProducts — Real-time Firestore product sync (Persistent Singleton)
 *
 * Architecture:
 *  - Persistent module-level cache for _overrides, _newProducts, and _merged.
 *  - Firestore listeners remain active across page navigations (no resets during route change).
 *  - Admin Cloudinary images override both `image` and `images[0]`.
 *  - Non-overridden products cleanly retain their OWN unique static product image (`p.image`).
 *  - 0ms zero-flash rendering across all customer page transitions.
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products as staticProducts, categories as staticCategories } from '@/data/products';

// Global singleton cache across entire app session
let _listeners = [];
let _subscribers = new Set();
let _overrides = {};
let _newProducts = [];
let _merged = computeInitialMerged();
let _initialized = false;

function buildProductImages(overrideImage, overrideImages, staticImages, staticImage) {
  const mainImage = overrideImage || staticImage || '/images/ui/placeholder.jpg';
  const baseList = overrideImages && overrideImages.length > 0
    ? overrideImages
    : (staticImages && staticImages.length > 0 ? staticImages : [mainImage]);

  // Ensure mainImage is strictly at index 0 and no duplicates
  return [mainImage, ...baseList.filter((img) => img !== mainImage)];
}

function computeMerged() {
  const mergedStatic = staticProducts.map((p) => {
    const override = _overrides[p.id] || {};
    const mainImage = override.image || p.image;
    const images = buildProductImages(override.image, override.images, p.images, p.image);

    return {
      ...p,
      ...override,
      image: mainImage,
      images,
    };
  });

  const filteredStatic = mergedStatic.filter((p) => !p._deleted);

  const processedNew = _newProducts.map((np) => {
    const mainImage = np.image || '/images/ui/placeholder.jpg';
    const images = np.images && np.images.length > 0
      ? [mainImage, ...np.images.filter((img) => img !== mainImage)]
      : [mainImage];
    return {
      ...np,
      image: mainImage,
      images,
    };
  });

  _merged = [...filteredStatic, ...processedNew];
  _subscribers.forEach((fn) => fn(_merged));
}

function computeInitialMerged() {
  return staticProducts.map((p) => ({
    ...p,
    images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : ['/images/ui/placeholder.jpg']),
  }));
}

function setupListeners() {
  if (_initialized) return;
  _initialized = true;

  // Listener 1: product_overrides (edits to static products)
  const overridesUnsub = onSnapshot(
    collection(db, 'product_overrides'),
    (snap) => {
      _overrides = {};
      snap.forEach((doc) => {
        _overrides[doc.id] = doc.data();
      });
      computeMerged();
    },
    (err) => console.error('[useProducts] overrides listener error:', err)
  );

  // Listener 2: products_new (admin-added products), ordered newest first
  const newProductsUnsub = onSnapshot(
    query(collection(db, 'products_new'), orderBy('createdAt', 'desc')),
    (snap) => {
      _newProducts = [];
      snap.forEach((doc) => {
        _newProducts.push({ id: doc.id, isNew: true, ...doc.data() });
      });
      computeMerged();
    },
    (err) => console.error('[useProducts] new products listener error:', err)
  );

  _listeners = [overridesUnsub, newProductsUnsub];
}

// ─────────────────────────────────────────────────────────────
// Main hook — use this everywhere products are needed
// ─────────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState(_merged);
  const [loading, setLoading] = useState(!_initialized);

  useEffect(() => {
    // Start Firestore listeners if not already initialized
    setupListeners();

    // Subscribe to shared real-time updates
    const handler = (updated) => {
      setProducts([...updated]);
      setLoading(false);
    };
    _subscribers.add(handler);

    // Immediately push current cached state (instant render, no static flash)
    setProducts([..._merged]);
    setLoading(false);

    return () => {
      _subscribers.delete(handler);
      // Keep Firestore listeners active across route changes
    };
  }, []);

  return { products, loading, categories: staticCategories };
}

// ─────────────────────────────────────────────────────────────
// useCategories — Real-time Firestore category sync
// ─────────────────────────────────────────────────────────────
let _catListeners = [];
let _catSubscribers = new Set();
let _firestoreCats = [];
let _allCats = staticCategories;
let _catsInitialized = false;

function computeCategories() {
  const staticIds = new Set(staticCategories.map((c) => c.id));
  const newCats = _firestoreCats.filter((fc) => !staticIds.has(fc.id));
  const mergedStatic = staticCategories.map((sc) => {
    const override = _firestoreCats.find((fc) => fc.id === sc.id);
    return override ? { ...sc, ...override } : sc;
  });
  _allCats = [...mergedStatic, ...newCats];
  _catSubscribers.forEach((fn) => fn(_allCats));
}

function setupCatListeners() {
  if (_catsInitialized) return;
  _catsInitialized = true;
  const unsub = onSnapshot(
    collection(db, 'categories'),
    (snap) => {
      _firestoreCats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      computeCategories();
    },
    (err) => console.error('[useCategories] listener error:', err)
  );
  _catListeners = [unsub];
}

export function useCategories() {
  const [categories, setCategories] = useState(_allCats);

  useEffect(() => {
    setupCatListeners();

    const handler = (updated) => setCategories([...updated]);
    _catSubscribers.add(handler);

    setCategories([..._allCats]);

    return () => {
      _catSubscribers.delete(handler);
    };
  }, []);

  return { categories };
}
