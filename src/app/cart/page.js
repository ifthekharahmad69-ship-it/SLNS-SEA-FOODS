'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { items, itemCount, subtotal, savings, delivery, total, updateQty, removeItem, clearCart } = useCart();
  const { t } = useLanguage();

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const lines = items.map((i) => `• ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
    const msg = `Hi! I'd like to order:\n\n${lines}\n\nTotal: ₹${total}\n\nPlease confirm my order.`;
    window.open(`https://wa.me/917995177216?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>{t('cart.empty')}</h2>
            <p>{t('cart.emptyDesc')}</p>
            <Link href="/shop/fish" className="btn btn-primary btn-lg" id="empty-cart-shop-btn">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">{t('nav.home')}</Link>
          <span className="separator">›</span>
          <span>{t('cart.title')} ({itemCount} {t('cart.items')})</span>
        </nav>

        <h1 className="page-title">{t('cart.title')}</h1>

        <div className="cart-layout">
          {/* Items */}
          <div>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                  <div className="cart-item-image">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-weight">{item.weight} · {item.unit}</div>
                    <div className="cart-item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="qty-value">{item.qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <span className="cart-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      {t('product.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1rem' }}
              id="clear-cart-btn"
            >
              🗑️ Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>{t('cart.subtotal')} ({itemCount} {t('cart.items')})</span>
              <span className="value">₹{subtotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="summary-row" style={{ color: 'var(--accent-green)' }}>
                <span>{t('cart.savings')}</span>
                <span className="value">−₹{savings.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>{t('cart.delivery')}</span>
              <span className="value" style={{ color: delivery === 0 ? 'var(--accent-green)' : 'inherit' }}>
                {delivery === 0 ? t('cart.free') : `₹${delivery}`}
              </span>
            </div>
            {delivery === 0 && subtotal > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                {t('cart.freeAbove')}
              </p>
            )}
            {delivery > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                {t('cart.freeUnlock', { n: 500 - subtotal })}
              </p>
            )}

            <div className="summary-row total">
              <span>{t('cart.total')}</span>
              <span className="value">₹{total.toLocaleString()}</span>
            </div>

            <div className="cart-summary-actions">
              <Link href="/checkout" className="btn btn-primary btn-lg" id="checkout-btn" style={{ textAlign: 'center' }}>
                {t('cart.checkout')}
              </Link>
              <button
                className="btn btn-whatsapp btn-lg"
                onClick={handleWhatsAppOrder}
                id="whatsapp-cart-btn"
              >
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('common.whatsapp')}
              </button>
              <Link href="/shop/fish" className="btn btn-ghost" style={{ textAlign: 'center' }}>
                ← {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
