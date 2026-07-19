import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | SLNS Fresh Sea Foods',
};

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="cart-empty">
          <div className="cart-empty-icon" style={{ fontSize: '5rem' }}>🐟</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '6rem', fontWeight: 800, color: 'var(--border)', lineHeight: 1, marginBottom: '0.5rem' }}>
            404
          </h1>
          <h2>Page Not Found</h2>
          <p>Looks like this page swam away! Let&apos;s get you back on track.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <Link href="/" className="btn btn-primary btn-lg" id="not-found-home-btn">Go Home</Link>
            <Link href="/shop/fish" className="btn btn-ghost btn-lg">Browse Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
