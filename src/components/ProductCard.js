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
  if (product.tags?.includes('bestseller')) return { label: t('product.bestseller'), cls: 'badge-bestseller' };
  if (product.type === 'dish') return { label: 'Ready Dish', cls: 'badge-dish' };
  if (product.tags?.includes('premium')) return { label: 'Premium', cls: 'badge-premium' };
  return { label: product.freshness || t('product.fresh'), cls: 'badge-fresh' };
}

/** Format qty for display: 0.5 → "½ kg", 1 → "1 kg", 1.5 → "1½ kg" */
function formatQty(qty) {
  const whole = Math.floor(qty);
  const half = (qty % 1) >= 0.4;
  if (whole === 0 && half) return '½ kg';
  if (whole > 0 && half) return `${whole}½ kg`;
  return `${whole} kg`;
}

export default function ProductCard({ product }) {
  const { addItem, removeItem, updateQty, items } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const discount = getDiscount(product.price, product.originalPrice);
  const badge = getBadge(product, t);

  // Find this product in cart
  const cartItem = items.find((i) => i.id === product.id);
  const inCart = !!cartItem;
  const cartQty = cartItem?.qty || 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    if (!user) { setShowAuth(true); return; }
    addItem(product); // starts at 0.5 if new, +0.5 if existing
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product.id, +(cartQty + 0.5).toFixed(1));
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = +(cartQty - 0.5).toFixed(1);
    if (next < 0.5) {
      removeItem(product.id);
    } else {
      updateQty(product.id, next);
    }
  };

  return (
    <>
      <Link href={`/product/${product.id}`} className="product-card" id={`product-${product.id}`}>

        {/* ── Image ── */}
        <div className="product-card-image">
          <Image
            src={product.image || '/images/ui/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover' }}
            unoptimized={product.image?.startsWith('http')}
          />
          {/* Badge */}
          <span className={`product-badge ${badge.cls}`}>{badge.label}</span>

          {/* Discount tag */}
          {discount > 0 && (
            <span className="product-card-discount">-{discount}%</span>
          )}

          {/* ── YummyCuts-style qty stepper on image corner ── */}
          {inCart ? (
            <div className="pc-stepper" onClick={(e) => e.preventDefault()}>
              <button
                className="pc-step-btn pc-step-minus"
                onClick={handleDecrease}
                aria-label="Decrease qty"
              >−</button>
              <span className="pc-step-qty">{formatQty(cartQty)}</span>
              <button
                className="pc-step-btn pc-step-plus"
                onClick={handleIncrease}
                aria-label="Increase qty"
              >+</button>
            </div>
          ) : (
            <button
              className="product-quick-add"
              onClick={handleAdd}
              aria-label={`Add ${product.name} to cart`}
              disabled={!product.inStock}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Body ── */}
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

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 6px', fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
            <span>★ 5.0</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Verified)</span>
          </div>

          {/* Price */}
          <div className="product-card-price">
            <span className="price-current">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="price-original">₹{product.originalPrice}</span>
            )}
            <span className="price-unit">/{product.unit?.replace('per ', '') || 'kg'}</span>
          </div>

          {/* ── Bottom CTA: + button or stepper ── */}
          {inCart ? (
            <div className="pc-bottom-stepper" onClick={(e) => e.preventDefault()}>
              <button
                className="pc-bottom-btn minus"
                onClick={handleDecrease}
                aria-label="Decrease"
              >−</button>
              <span className="pc-bottom-qty">{formatQty(cartQty)}</span>
              <button
                className="pc-bottom-btn plus"
                onClick={handleIncrease}
                aria-label="Increase"
              >+</button>
            </div>
          ) : (
            <button
              className="btn-cart"
              onClick={handleAdd}
              disabled={!product.inStock}
              id={`add-to-cart-${product.id}`}
            >
              {!product.inStock
                ? t('product.outOfStock')
                : `+ ${t('product.addToCart')}`}
            </button>
          )}
        </div>
      </Link>

      {showAuth && (
        <AuthGateModal
          message="Sign in to add items to your cart"
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
