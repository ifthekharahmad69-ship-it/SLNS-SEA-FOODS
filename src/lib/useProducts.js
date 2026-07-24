'use client';

/**
 * useProducts — Real-time Firestore product sync
 *
 * Architecture:
 *  - Immediately renders static products (zero loading flash)
 *  - Subscribes to Firestore onSnapshot for both:
 *      • products_new      (admin-added products)
 *      • product_overrides (admin edits to static products)
 *  - Merges live Firestore data with static products in real time
 *  - Any admin CRUD change pushes to all customer browsers INSTANTLY
 *  - Cleans up Firestore listeners on component unmount
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products as staticProducts, categories as staticCategories } from '@/data/products';

// Module-level shared state — one Firestore connection for all hook instances
let _listeners = [];
let _subscribers = new Set();
let _overrides = {};
let _newProducts = [];
let _merged = staticProducts; // start with static instantly
let _initialized = false;

function computeMerged() {
  // Merge static products with their Firestore overrides
  const mergedStatic = staticProducts.map((p) => ({
    ...p,
    ...(_overrides[p.id] || {}),
  }));
  // Filter out products that were deleted via their override having _deleted: true
  const filteredStatic = mergedStatic.filter((p) => !p._deleted);
  _merged = [...filteredStatic, ..._newProducts];
  // Notify all hook subscribers
  _subscribers.forEach((fn) => fn(_merged));
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

function teardownListeners() {
  _listeners.forEach((unsub) => unsub());
  _listeners = [];
  _initialized = false;
  _overrides = {};
  _newProducts = [];
  _merged = staticProducts;
}

// ─────────────────────────────────────────────────────────────
// Main hook — use this everywhere products are needed
// ─────────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState(_merged);
  const [loading, setLoading] = useState(!_initialized);

  useEffect(() => {
    // Subscribe to shared updates
    const handler = (updated) => {
      setProducts([...updated]);
      setLoading(false);
    };
    _subscribers.add(handler);

    // Start Firestore listeners (shared — only one connection regardless of hook instances)
    setupListeners();

    // Push current state immediately
    setProducts([..._merged]);
    setLoading(false);

    return () => {
      _subscribers.delete(handler);
      // Only tear down listeners when no components are using the hook
      if (_subscribers.size === 0) {
        teardownListeners();
      }
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
  // Merge: static categories + any Firestore-only additions
  const staticIds = new Set(staticCategories.map((c) => c.id));
  const newCats = _firestoreCats.filter((fc) => !staticIds.has(fc.id));
  // For static cats, check if there's a Firestore override
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

function teardownCatListeners() {
  _catListeners.forEach((u) => u());
  _catListeners = [];
  _catsInitialized = false;
  _firestoreCats = [];
  _allCats = staticCategories;
}

export function useCategories() {
  const [categories, setCategories] = useState(_allCats);

  useEffect(() => {
    const handler = (updated) => setCategories([...updated]);
    _catSubscribers.add(handler);
    setupCatListeners();
    setCategories([..._allCats]);

    return () => {
      _catSubscribers.delete(handler);
      if (_catSubscribers.size === 0) teardownCatListeners();
    };
  }, []);

  return { categories };
}
