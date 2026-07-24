'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '@/lib/useProducts';
import ProductCard from '@/components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  // Use live products (Firestore real-time) so search includes admin-added/edited products
  const { products, loading } = useProducts();

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    const lower = q.toLowerCase();
    const found = products.filter((p) =>
      (p.name || '').toLowerCase().includes(lower) ||
      (p.category || '').toLowerCase().includes(lower) ||
      (p.description || '').toLowerCase().includes(lower) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(lower))
    );
    setResults(found);
    setSearched(true);
  }, [products]);

  useEffect(() => { doSearch(initialQ); }, [initialQ, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
          <h1 className="page-title">Search Products</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: 480, marginTop: '1rem' }}>
            <input
              type="search"
              className="form-input"
              placeholder="Search fish, prawns, crabs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="search-input"
              autoFocus
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" id="search-submit-btn">
              🔍 Search
            </button>
          </form>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>⏳ Loading products...</p>
        )}

        {searched && !loading && (
          <p className="search-results-count">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{initialQ}&rdquo;
          </p>
        )}

        {results.length > 0 ? (
          <div className="products-grid" style={{ marginTop: '1.5rem' }}>
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : searched && !loading ? (
          <div className="cart-empty" style={{ paddingTop: '3rem' }}>
            <div className="cart-empty-icon">🔍</div>
            <h2>No results found</h2>
            <p>Try different keywords or browse our categories.</p>
            <Link href="/shop/fish" className="btn btn-primary">Browse Shop</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-wrapper"><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>⏳ Loading...</div></div>}>
      <SearchContent />
    </Suspense>
  );
}
