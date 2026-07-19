'use client';

import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/lib/useProducts';

const TABS = [
  { key: 'all',        label: '⭐ All',       icon: '⭐' },
  { key: 'fish',       label: '🐟 Fish',      icon: '🐟' },
  { key: 'prawns',     label: '🦐 Prawns',    icon: '🦐' },
  { key: 'crabs',      label: '🦀 Crabs',     icon: '🦀' },
  { key: 'dry-seafood',label: '🌊 Dry',       icon: '🌊' },
  { key: 'dishes',     label: '🍽️ Dishes',    icon: '🍽️' },
];

export default function CategoryShop({ staticProducts }) {
  const [active, setActive] = useState(null); // null = nothing selected yet
  const [animating, setAnimating] = useState(false);
  const productsRef = useRef(null);

  // Try to get live products from Firestore, fall back to static
  const { products: liveProducts } = useProducts();
  const allProducts = (liveProducts && liveProducts.length > 0)
    ? liveProducts
    : (staticProducts || []);

  const filtered = active === null
    ? []
    : active === 'all'
      ? allProducts.filter((p) => p.inStock !== false)
      : active === 'dishes'
        ? allProducts.filter((p) => p.type === 'dish' && p.inStock !== false)
        : allProducts.filter((p) => p.category === active && p.type !== 'dish' && p.inStock !== false);

  const handleTab = (key) => {
    if (key === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(key);
      setAnimating(false);
      // Scroll to products smoothly
      if (productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  return (
    <section className="section" id="shop-by-category" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">🛒 Shop by Category</h2>
          <p className="section-subtitle">
            {active === null
              ? 'Tap a category below to browse products'
              : active === 'all'
                ? `Showing all ${filtered.length} products`
                : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} in ${TABS.find(t => t.key === active)?.label || active}`}
          </p>
        </div>

        {/* ── Category Tab Bar ──────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '0.6rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '2.5rem',
        }}>
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                id={`cat-tab-${tab.key}`}
                onClick={() => handleTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 20px', borderRadius: '999px',
                  border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  background: isActive
                    ? 'var(--accent)'
                    : 'var(--bg-card)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 14px rgba(15,76,117,0.3)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                <span>{tab.label.split(' ').slice(1).join(' ')}</span>
              </button>
            );
          })}
        </div>

        {/* ── Products Grid ─────────────────────────────────── */}
        <div ref={productsRef}>
          {active === null ? (
            /* Before any selection — show visual prompt */
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👆</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                Select a category above to see products
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>😕</div>
              <p>No products available in this category yet.</p>
            </div>
          ) : (
            <div
              className="products-grid"
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateY(12px)' : 'translateY(0)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
              }}
            >
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
