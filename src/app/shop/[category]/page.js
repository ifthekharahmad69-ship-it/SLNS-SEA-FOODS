'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts, useCategories } from '@/lib/useProducts';
import ProductCard from '@/components/ProductCard';

const CATEGORY_META = {
  fish:    { title: 'Fresh Fish', icon: '🐟', desc: 'Wild-caught & farm-fresh fish — whole, fillets, and steaks' },
  prawns:  { title: 'Prawns',     icon: '🦐', desc: 'Tiger prawns, vannamei & more — cleaned and ready to cook' },
  crabs:   { title: 'Crabs',      icon: '🦀', desc: 'Live & cleaned crabs — mud crabs, blue crabs, flower crabs' },
  pickles: { title: 'Non-Veg Pickles', icon: '🫙', desc: 'Authentic Andhra-style spicy Chicken & Prawn pickles' },
};

export default function ShopPage() {
  const params = useParams();
  const slug = params?.category || 'fish';
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const { products } = useProducts();

  const meta = CATEGORY_META[slug] || CATEGORY_META.fish;

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.category === slug);

    if (typeFilter === 'raw') list = list.filter((p) => p.type === 'raw');

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice);

    return list;
  }, [slug, typeFilter, sortBy, products]);

  const cats = ['fish', 'prawns', 'crabs', 'pickles'];

  return (
    <div className="page-wrapper" style={{ paddingBottom: 'calc(var(--mobile-nav-height, 64px) + 24px)' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">›</span>
          <Link href="/shop/fish">Shop</Link>
          <span className="separator">›</span>
          <span>{meta.title}</span>
        </nav>

        {/* Page Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 className="page-title" style={{ marginBottom: '0.3rem' }}>{meta.icon} {meta.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{meta.desc}</p>
        </div>

        {/* Category Tabs — horizontal scroll on mobile */}
        <div className="filter-tabs" role="tablist" aria-label="Category filters" style={{ marginBottom: '0.75rem' }}>
          {cats.map((c) => (
            <Link
              key={c}
              href={`/shop/${c}`}
              className={`filter-tab${slug === c ? ' active' : ''}`}
              role="tab"
              aria-selected={slug === c}
            >
              {CATEGORY_META[c].icon} {CATEGORY_META[c].title}
            </Link>
          ))}
        </div>

        {/* Controls row — sort + type filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-tabs" style={{ marginBottom: 0, gap: '0.4rem', flexShrink: 0 }}>
            {[['all', 'All'], ['raw', '🐟 Fresh Only']].map(([v, l]) => (
              <button
                key={v}
                className={`filter-tab${typeFilter === v ? ' active' : ''}`}
                onClick={() => setTypeFilter(v)}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label htmlFor="sort-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto', height: '34px', padding: '0 10px', fontSize: '0.82rem' }}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="search-results-count" style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '0.83rem' }}>
          {filtered.length} products found
        </p>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="cart-empty">
            <div className="cart-empty-icon">{meta.icon}</div>
            <h2>No products found</h2>
            <p>Try adjusting your filters or browse other categories.</p>
            <Link href="/shop/fish" className="btn btn-primary">Browse All</Link>
          </div>
        )}
      </div>
    </div>
  );
}
