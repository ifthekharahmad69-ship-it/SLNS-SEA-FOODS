'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, getRelatedProducts } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/ReviewSection';

function getDiscount(price, original) {
  return Math.round(((original - price) / original) * 100);
}

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductById(params?.id);
  const { addItem, items, updateQty, removeItem } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return notFound();

  const related = getRelatedProducts(product.id, 4);
  const discount = getDiscount(product.price, product.originalPrice);
  const cartItem = items.find((i) => i.id === product.id);
  const qty = cartItem?.qty || 0;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    const msg = `Hi! I'd like to order *${product.name}* (₹${product.price}/${product.unit.replace('per ', '')}). Please confirm availability.`;
    window.open(`https://wa.me/917995177216?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="page-wrapper">
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
        <div className="product-detail">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              <Image
                src={product.images[activeImg] || product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
              {discount > 0 && (
                <span className="product-card-discount" style={{ top: '1rem', right: '1rem', padding: '6px 12px', fontSize: '0.85rem' }}>
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="72px" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            {/* Tags */}
            <div className="product-tags">
              {product.tags.slice(0, 3).map((t) => (
                <span key={t} className="tag">#{t}</span>
              ))}
              {!product.inStock && <span className="tag" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Out of Stock</span>}
            </div>

            <h1 id="product-name">{product.name}</h1>

            {/* Freshness / meta */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--accent-green)', fontWeight: 500 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {product.freshness}
              </span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>📦 {product.weight}</span>
              {product.serves && <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>👥 {product.serves}</span>}
              {product.prepTime && <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>⏱️ {product.prepTime}</span>}
            </div>

            {/* Price Box */}
            <div className="product-price-box">
              <span className="current">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="original">₹{product.originalPrice}</span>
                  <span className="discount">Save {discount}%</span>
                </>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.unit}</span>
            </div>

            <p className="product-description">{product.description}</p>

            {/* Qty + Cart */}
            {product.inStock ? (
              <>
                {qty > 0 ? (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="qty-control" style={{ borderColor: 'var(--accent)' }}>
                      <button className="qty-btn" onClick={() => updateQty(product.id, qty - 1)} aria-label="Decrease quantity">−</button>
                      <span className="qty-value">{qty}</span>
                      <button className="qty-btn" onClick={() => addItem(product)} aria-label="Increase quantity">+</button>
                    </div>
                    <Link href="/cart" className="btn btn-primary" style={{ flex: 1 }} id="view-cart-btn">
                      View Cart · ₹{product.price * qty}
                    </Link>
                  </div>
                ) : null}

                <div className="product-actions">
                  <button
                    className={`btn btn-warm btn-lg${added ? ' btn-cart added' : ''}`}
                    onClick={handleAdd}
                    id="add-to-cart-detail-btn"
                    disabled={!product.inStock}
                  >
                    {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                  </button>
                  <button
                    className="btn btn-whatsapp btn-lg"
                    onClick={handleWhatsApp}
                    id="whatsapp-order-btn"
                  >
                    <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Order on WhatsApp
                  </button>
                </div>
              </>
            ) : (
              <button className="btn btn-ghost btn-lg" disabled style={{ width: '100%' }}>
                Out of Stock
              </button>
            )}

            {/* Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
              {[
                ['🌊', 'Farm to door in 24h'],
                ['🧹', 'Cleaned & ready'],
                ['🚀', 'Same-day delivery'],
                ['💯', 'Freshness guaranteed'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <section style={{ padding: '0 0 2rem' }}>
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
