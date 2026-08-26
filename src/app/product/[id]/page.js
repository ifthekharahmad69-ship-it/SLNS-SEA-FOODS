'use client';

import { useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/lib/useProducts';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

function getDiscount(price, original) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, items, updateQty } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectQty, setSelectQty] = useState(1);

  // Use live products from API (falls back to static instantly)
  const { products: allProducts } = useProducts();

  // Find product: first check live API products, then fall back to static
  const liveProduct = allProducts.find((p) => p.id === params?.id);
  const staticProduct = getProductById(params?.id);
  const product = liveProduct || staticProduct;

  if (!product) return notFound();

  const related = getRelatedProducts(product.id, 4);
  const discount = getDiscount(product.price, product.originalPrice);
  const cartItem = items.find((i) => i.id === product.id);
  const cartQty = cartItem?.qty || 0;

  const handleAdd = () => {
    addItem(product, selectQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, selectQty);
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const msg = `Hi! I'd like to order *${product.name}* (Qty: ${selectQty}, Total: ₹${product.price * selectQty}). Please confirm availability.`;
    window.open(`https://wa.me/917995177216?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Build images array — support both single image and images array
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : ['/images/placeholder.jpg'];

  const currentImage = images[activeImg] || images[0];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images.map((img) => (img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slnsseafoodsandpickles.in'}${img}`)),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.slnsseafoodsandpickles.in'}/product/${product.id}`,
    },
  };

  return (
    <div className="page-wrapper">
      {/* Product JSON-LD for Google Rich Search Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="separator">›</span>
          <Link href={`/shop/${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link>
          <span className="separator">›</span>
          <span>{product.name}</span>
        </nav>

        {/* Detail Layout */}
        <div className="product-detail" style={{ gap: '2rem' }}>

          {/* ── Gallery Section ── */}
          <div className="product-gallery">
            {/* Background Box with Border for Main Image */}
            <div
              className="product-main-image"
              onClick={() => setIsZoomed(true)}
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '380px',
                height: '340px',
                background: '#f8fafc',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-in',
                padding: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
              title="Click to view full image zoom"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  transition: 'transform 0.3s ease',
                }}
              />

              {discount > 0 && (
                <span className="product-card-discount" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '6px 12px', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', zIndex: 2 }}>
                  -{discount}% OFF
                </span>
              )}

              <span style={{
                position: 'absolute', bottom: '1rem', right: '1rem',
                background: 'rgba(0,0,0,0.65)', color: 'white',
                padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem',
                backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                🔍 Tap to zoom
              </span>
            </div>

            {/* Thumbnail Selection Strip */}
            {images.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: activeImg === i ? '2.5 solid #0f4c75' : '1px solid #e2e8f0',
                      outline: activeImg === i ? '2px solid #0f4c75' : 'none',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      padding: 2,
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info Section ── */}
          <div className="product-info">
            {/* Brand / Category Tag */}
            <div style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.35rem' }}>
              SLNS FRESH SEA FOODS
            </div>

            <h1 id="product-name" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Freshness / Meta */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {product.freshness && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.08)', padding: '3px 10px', borderRadius: '20px' }}>
                  ✓ {product.freshness}
                </span>
              )}
              {product.weight && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📦 {product.weight}</span>}
              {product.serves && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>👥 {product.serves}</span>}
            </div>

            {/* Price Display */}
            <div className="product-price-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span className="current" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                ₹{product.price}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original" style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                    ₹{product.originalPrice}
                  </span>
                  <span className="discount" style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    Save {discount}%
                  </span>
                </>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                {product.unit || 'per kg'}
              </span>
            </div>

            <p className="product-description" style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Quantity Selector & Buy Actions */}
            {product.inStock ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Quantity Control */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quantity ({product.unit?.includes('kg') ? 'kg' : 'units'})
                  </label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #cbd5e1', borderRadius: '10px', background: '#ffffff', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setSelectQty((q) => Math.max(0.5, +(q - 0.5).toFixed(1)))}
                      style={{ width: 42, height: 42, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700, color: '#334155' }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={{ padding: '0 16px', fontWeight: 700, fontSize: '1rem', minWidth: 50, textAlign: 'center', color: '#0f172a' }}>
                      {selectQty} {product.unit?.includes('kg') ? 'kg' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectQty((q) => +(q + 0.5).toFixed(1))}
                      style={{ width: 42, height: 42, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700, color: '#334155' }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {/* Add to Cart Button */}
                  <button
                    className={`btn btn-lg${added ? ' added' : ''}`}
                    onClick={handleAdd}
                    id="add-to-cart-detail-btn"
                    style={{
                      width: '100%',
                      height: '48px',
                      borderRadius: '10px',
                      border: '1.5px solid #0f172a',
                      background: added ? '#10b981' : '#ffffff',
                      color: added ? '#ffffff' : '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {added ? '✓ Added to Cart!' : `Add to Cart · ₹${(product.price * selectQty).toFixed(0)}`}
                  </button>

                  {/* BUY IT NOW Button (Prominent Black Button as in Screenshot 4 & 5) */}
                  <button
                    onClick={handleBuyNow}
                    id="buy-it-now-btn"
                    style={{
                      width: '100%',
                      height: '50px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#111827',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(17,24,39,0.35)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    BUY IT NOW
                  </button>

                  {/* Order via WhatsApp */}
                  <button
                    className="btn btn-whatsapp btn-lg"
                    onClick={handleWhatsApp}
                    id="whatsapp-order-btn"
                    style={{ height: '46px', borderRadius: '10px' }}
                  >
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Order on WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-out-of-stock btn-lg" disabled style={{ width: '100%', height: 48 }}>
                🚫 Out of Stock
              </button>
            )}

            {/* Guarantees Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              {[
                ['🌊', 'Farm to door in 24h'],
                ['🧹', 'Cleaned & ready to cook'],
                ['🚀', 'Express delivery'],
                ['💯', 'Freshness guaranteed'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── High Resolution Image Zoom Modal / Lightbox ── */}
        {isZoomed && (
          <div
            onClick={() => setIsZoomed(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              cursor: 'zoom-out',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <button
              onClick={() => setIsZoomed(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                width: 44,
                height: 44,
                borderRadius: '50%',
                fontSize: '1.4rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
              }}
              aria-label="Close zoom preview"
            >
              ✕
            </button>
            <div
              style={{
                maxWidth: '92vw',
                maxHeight: '88vh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                {product.name} — High Resolution Detail View
              </p>
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <section style={{ padding: '2rem 0' }}>
          <ReviewSection productId={product.id} productName={product.name} />
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="section" id="related-products">
            <h2 className="section-title">You Might Also Like</h2>
            <div className="products-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
