'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AuthGateModal from '@/components/AuthGateModal';

function getDiscount(price, original) {
  return Math.round(((original - price) / original) * 100);
}

function getBadge(product, t) {
  if (!product.inStock) return { label: t('product.outOfStock'), cls: 'badge-out' };
  if (product.tags.includes('bestseller')) return { label: t('product.bestseller'), cls: 'badge-bestseller' };
  if (product.type === 'dish') return { label: 'Ready Dish', cls: 'badge-dish' };
  if (product.tags.includes('premium')) return { label: 'Premium', cls: 'badge-premium' };
  return { label: product.freshness || t('product.fresh'), cls: 'badge-fresh' };
}

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [added, setAdded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const discount = getDiscount(product.price, product.originalPrice);
  const badge = getBadge(product, t);
  const inCart = items.some((i) => i.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    if (!user) { setShowAuth(true); return; } // 🔒 require login
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };


  return (
    <>
    <Link href={`/product/${product.id}`} className="product-card" id={`product-${product.id}`}>
      {/* Image */}
      <div className="product-card-image">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          style={{ objectFit: 'cover' }}
          onError={(e) => { e.target.src = '/images/ui/placeholder.jpg'; }}
        />
        {/* Badge */}
        <span className={`product-badge ${badge.cls}`}>{badge.label}</span>

        {/* Discount */}
        {discount > 0 && (
          <span className="product-card-discount">-{discount}%</span>
        )}

        {/* Quick Add */}
        <button
          className={`product-quick-add${added ? ' btn-cart added' : ''}`}
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
          disabled={!product.inStock}
        >
          {added ? (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="product-card-body">
        <div className="product-card-category">
          {product.type === 'dish' ? '🍽️ Dish' : `🐟 ${product.category}`}
        </div>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-weight">{product.weight} · {product.unit}</div>

        {/* Dish meta */}
        {product.type === 'dish' && product.serves && (
          <div className="product-card-meta">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {product.serves}
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {product.prepTime}
          </div>
        )}

        {/* Star Rating Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 8px', fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
          <span>★ 5.0</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Verified)</span>
        </div>

        {/* Price */}
        <div className="product-card-price">
          <span className="price-current">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">₹{product.originalPrice}</span>
          )}
          <span className="price-unit">/{product.unit.replace('per ', '')}</span>
        </div>

        {/* CTA */}
        <button
          className={`btn-cart${added ? ' added' : ''}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
          id={`add-to-cart-${product.id}`}
        >
          {!product.inStock
            ? t('product.outOfStock')
            : added
            ? t('product.added')
            : inCart
            ? `+ ${t('product.addToCart')}`
            : t('product.addToCart')}
        </button>
      </div>
    </Link>

    {/* Auth gate — shows when guest tries to add to cart */}
    {showAuth && (
      <AuthGateModal
        message="Sign in to add items to your cart"
        onClose={() => setShowAuth(false)}
      />
    )}
  </>
  );
}
