'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchProducts, products } from '@/data/products';
import ProductCard from '@/components/ProductCard';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setResults(searchProducts(q));
    setSearched(true);
  }, []);

  useEffect(() => { doSearch(initialQ); }, [initialQ, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    doSearch(query);
  };

  const popularSearches = ['Rohu', 'Tiger Prawn', 'Crab Masala', 'Fish Fry', 'Biryani', 'Pomfret'];

  return (
    <>
      {/* Search Input */}
      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <svg
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }}
          width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="search-page-input"
          type="search"
          className="search-page-input"
          placeholder="Search for fish, prawns, crabs, dishes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {/* Popular searches */}
      {!searched && (
        <>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Popular searches:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {popularSearches.map((s) => (
              <button
                key={s}
                className="filter-tab"
                onClick={() => {
                  setQuery(s);
                  router.push(`/search?q=${encodeURIComponent(s)}`);
                  doSearch(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>All products:</p>
          <div className="products-grid">
            {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}

      {/* Results */}
      {searched && (
        <>
          <p className="search-results-count">
            {results.length > 0
              ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${initialQ || query}"`
              : `No results for "${initialQ || query}"`}
          </p>
          {results.length > 0 ? (
            <div className="products-grid">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="cart-empty" style={{ padding: '3rem' }}>
              <div className="cart-empty-icon">🔍</div>
              <h2>No results found</h2>
              <p>Try searching for &ldquo;fish&rdquo;, &ldquo;prawn&rdquo;, &ldquo;crab&rdquo;, or &ldquo;biryani&rdquo;</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                <Link href="/shop/fish" className="btn btn-primary">Browse Fish</Link>
                <Link href="/shop/prawns" className="btn btn-ghost" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>Browse Prawns</Link>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="page-title" style={{ marginTop: '1rem' }}>Search Products</h1>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            Loading search...
          </div>
        }>
          <SearchContent />
        </Suspense>
      </div>
    </div>
  );
}
