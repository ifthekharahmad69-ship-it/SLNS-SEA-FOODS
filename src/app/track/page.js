'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MapWrapper from '@/components/MapWrapper';
import { useLanguage } from '@/context/LanguageContext';

const STATUS_LABELS = {
  pending:          { label: '🕐 Order Placed',      color: '#f59e0b' },
  confirmed:        { label: '✅ Confirmed',           color: '#3b82f6' },
  preparing:        { label: '👨‍🍳 Preparing',          color: '#8b5cf6' },
  out_for_delivery: { label: '🏍️ Out for Delivery',   color: '#f97316' },
  delivered:        { label: '✅ Delivered',           color: '#10b981' },
  cancelled:        { label: '❌ Cancelled',           color: '#ef4444' },
};

function buildTimeline(status, t) {
  const steps = [
    { key: 'pending',          label: t('track.status.pending'),          desc: t('track.timeline_desc.pending') },
    { key: 'confirmed',        label: t('track.status.confirmed'),        desc: t('track.timeline_desc.confirmed') },
    { key: 'preparing',        label: t('track.status.preparing'),        desc: t('track.timeline_desc.preparing') },
    { key: 'out_for_delivery', label: t('track.status.out_for_delivery'), desc: t('track.timeline_desc.out_for_delivery') },
    { key: 'delivered',        label: t('track.status.delivered'),        desc: t('track.timeline_desc.delivered') },
  ];
  const order = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentIndex = order.indexOf(status);
  return steps.map((step, i) => ({
    ...step,
    done: i < currentIndex,
    active: i === currentIndex,
  }));
}

// Inner component wrapped in Suspense for useSearchParams
function TrackForm() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimerRef = useRef(null);
  const currentOrderIdRef = useRef('');

  // Auto-fill from URL param
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      const upper = idFromUrl.toUpperCase().trim();
      setOrderId(upper);
      currentOrderIdRef.current = upper;
      fetchOrder(upper);
    }
  }, []); // eslint-disable-line

  // Cleanup refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, []);

  const fetchOrder = useCallback(async (id) => {
    const searchId = (id || orderId).toUpperCase().trim();
    if (!searchId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(searchId)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOrder(null);
        setError(
          res.status === 404
            ? t('track.notFound', { id: searchId })
            : t('common.error')
        );
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      } else {
        setOrder(data.order);
        setLastUpdated(new Date());
        setError('');
      }
    } catch {
      setError(t('track.networkError'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    const searchId = orderId.toUpperCase().trim();
    if (!searchId) return;

    currentOrderIdRef.current = searchId;
    setOrder(null);

    // Stop previous auto-refresh
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);

    fetchOrder(searchId);

    // Auto-refresh every 20 seconds for live status updates
    refreshTimerRef.current = setInterval(() => {
      fetchOrder(currentOrderIdRef.current);
    }, 20000);
  };

  const statusInfo  = order ? (STATUS_LABELS[order.status] || STATUS_LABELS.pending) : null;
  const timelineSteps = order ? buildTimeline(order.status, t) : [];

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 760 }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">{t('nav.home')}</Link>
          <span className="separator">›</span>
          <span>{t('nav.track')}</span>
        </nav>

        <h1 className="page-title">{t('track.title')}</h1>

        {/* Search box */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-card)', marginBottom: '1.5rem' }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label" htmlFor="order-id-input">
                {t('track.label')}
              </label>
              <input
                id="order-id-input"
                type="text"
                className="form-input"
                placeholder={t('track.placeholder')}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: 48, minWidth: 140, whiteSpace: 'nowrap' }}
              id="track-order-btn"
              disabled={loading || !orderId.trim()}
            >
              {loading ? t('track.searching') : t('track.button')}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div style={{ marginTop: '0.875rem', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {/* Live update badge */}
          {order && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('track.autoRefresh', { time: lastUpdated ? lastUpdated.toLocaleTimeString('en-IN') : '—' })}
              </span>
              <button
                onClick={() => fetchOrder(currentOrderIdRef.current)}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
              >
                🔄 Refresh now
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && !order && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <p>Looking up your order...</p>
          </div>
        )}

        {/* Order Card */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>

              {/* Order ID + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>Order ID</p>
                  <h2 style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent)', letterSpacing: '1px' }}>{order.orderId}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {order.customer} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: 'var(--radius-full)',
                    background: `${statusInfo?.color}18`,
                    fontSize: '0.9rem', fontWeight: 700, color: statusInfo?.color,
                    border: `1.5px solid ${statusInfo?.color}30`,
                  }}>
                    {statusInfo?.label}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Total: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>₹{order.total}</strong>
                  </p>
                </div>
              </div>

              {/* Payment info */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {order.payment === 'upi' ? '📱 UPI Payment' : '💵 Cash on Delivery'}
                </span>
                {order.payment === 'upi' && (
                  <span style={{
                    fontSize: '0.78rem', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600,
                    background: order.paymentStatus === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                  }}>
                    {order.paymentStatus === 'paid' ? '✅ Payment Confirmed' : '⏳ Payment Pending'}
                  </span>
                )}
              </div>

              {/* Delivery address */}
              {order.address && (
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Delivering to</span>
                  <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {typeof order.address === 'object'
                      ? `${order.address.full}, ${order.address.city} - ${order.address.pincode}`
                      : order.address}
                  </p>
                </div>
              )}

              {/* Items */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.625rem' }}>🛒 Order Items</p>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.88rem', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.name} <span style={{ color: 'var(--text-muted)' }}>× {item.qty}</span></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{item.price * item.qty}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--border)', fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>₹{order.total}</span>
                </div>
              </div>

              {/* Timeline */}
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '1rem' }}>📍 Delivery Timeline</h3>
              <div className="order-timeline">
                {timelineSteps.map((step, i) => (
                  <div key={i} className={`timeline-step${step.done ? ' completed' : step.active ? ' active' : ''}`}>
                    <div className="timeline-dot" />
                    <h4>{step.label}</h4>
                    <p>{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className="btn btn-primary"
                  id="toggle-map-btn"
                >
                  {showMap ? '🗺️ Hide Map' : '🗺️ Show Live Map'}
                </button>
                <a
                  href={`https://wa.me/917995177216?text=Hi! I want to check status of my order ${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  id="track-whatsapp-btn"
                >
                  📱 Chat with Us
                </a>
                <Link href="/shop/fish" className="btn btn-ghost">Continue Shopping</Link>
              </div>
            </div>

            {/* Live Map */}
            {showMap && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                    📍 Live Location Map
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)' }}>
                    OpenStreetMap
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                  Click <strong>📍 Track My Location</strong> to see your GPS position and distance from our store.
                </p>
                <MapWrapper height="440px" showUserLocation={true} />
              </div>
            )}
          </div>
        )}

        {/* No order — show store map */}
        {!order && !loading && !error && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>
                🗺️ Find Our Store
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
              Enter your Order ID above to track your delivery, or see our store location below.
            </p>
            <MapWrapper height="380px" showUserLocation={true} />
          </div>
        )}
      </div>
    </div>
  );
}

// Default export wraps in Suspense so useSearchParams works at build time
export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading tracking details...</div>
      </div>
    }>
      <TrackForm />
    </Suspense>
  );
}
