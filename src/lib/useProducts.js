'use client';

// useProducts — fetches merged products (static + Firestore overrides) from API
// Falls back to static products.js instantly if API is slow or fails

import { useState, useEffect } from 'react';
import { products as staticProducts, categories } from '@/data/products';

let cache = null; // Simple in-memory cache to avoid repeated fetches

export function useProducts() {
  const [products, setProducts] = useState(cache || staticProducts);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return; // Use cached version if available

    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          cache = data.products;
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Silently fall back to static products on error
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, categories };
}
