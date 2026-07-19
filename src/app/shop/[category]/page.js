'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '@/lib/useProducts';
import ProductCard from '@/components/ProductCard';

const CATEGORY_META = {
  fish: { title: 'Fresh Fish', icon: '🐟', desc: 'Wild-caught & farm-fresh fish — whole, fillets, and ready dishes' },
  prawns: { title: 'Prawns', icon: '🦐', desc: 'Tiger prawns, vannamei & more — cleaned and ready to cook' },
  crabs: { title: 'Crabs', icon: '🦀', desc: 'Live & cleaned crabs — mud crabs, blue crabs, flower crabs' },
  dishes: { title: 'Ready Dishes', icon: '🍽️', desc: 'Authentic Andhra seafood dishes cooked fresh and delivered hot' },
};

export default function ShopPage() {
  const params = useParams();
  const slug = params?.category || 'fish';
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const { products } = useProducts();

  const meta = CATEGORY_META[slug] || CATEGORY_META.fish;

  const filtered = useMemo(() => {
    let list =
      slug === 'dishes'
        ? products.filter((p) => p.type === 'dish')
        : products.filter((p) => p.category === slug);

    if (typeFilter === 'raw') list = list.filter((p) => p.type === 'raw');
    if (typeFilter === 'dish') list = list.filter((p) => p.type === 'dish');

    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice);

    return list;
  }, [slug, typeFilter, sortBy, products]);

  const cats = ['fish', 'prawns', 'crabs', 'dishes'];

  return (
    <div className="page-wrapper">
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
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-title">{meta.icon} {meta.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{meta.desc}</p>
        </div>

        {/* Category Tabs */}
        <div className="filter-tabs" role="tablist" aria-label="Category filters">
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

        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {slug !== 'dishes' && (
            <div className="filter-tabs" style={{ marginBottom: 0, gap: '0.5rem' }}>
              {[['all', 'All'], ['raw', '🐟 Raw'], ['dish', '🍽️ Dishes']].map(([v, l]) => (
                <button
                  key={v}
                  className={`filter-tab${typeFilter === v ? ' active' : ''}`}
                  onClick={() => setTypeFilter(v)}
                  style={{ fontSize: '0.82rem' }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="sort-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ width: 'auto', height: '36px', padding: '0 12px', fontSize: '0.85rem' }}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="search-results-count" style={{ marginTop: 0 }}>{filtered.length} products found</p>

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
