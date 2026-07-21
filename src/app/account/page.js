'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Redirect if not logged in once auth is resolved
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Fetch orders for this user
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    fetch(`/api/orders?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const statusColor = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    preparing: '#8b5cf6',
    out_for_delivery: '#0ea5e9',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  const statusLabel = {
    pending: '⏳ Pending',
    confirmed: '✅ Confirmed',
    preparing: '👨‍🍳 Preparing',
    out_for_delivery: '🛵 Out for Delivery',
    delivered: '✅ Delivered',
    cancelled: '❌ Cancelled',
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="page-title" style={{ marginTop: '1rem' }}>My Account</h1>

        {/* Profile Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
        }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Profile" width={64} height={64}
                style={{ borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary, #0ea5e9))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem', fontWeight: 700, color: 'white',
                border: '3px solid var(--accent)',
              }}>
                {(user.displayName || user.email || user.phoneNumber || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.displayName || 'Welcome!'}
            </h2>
            {user.email && (
              <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📧 {user.email}</p>
            )}
            {user.phoneNumber && (
              <p style={{ margin: '0 0 2px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📱 {user.phoneNumber}</p>
            )}
          </div>
          <button
            onClick={async () => { await signOut(); router.push('/'); }}
            className="btn btn-ghost"
            style={{ fontSize: '0.82rem', flexShrink: 0 }}
            id="account-signout-btn"
          >
            Sign Out
          </button>
        </div>

        {/* Order History */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          🛒 My Orders
        </h2>

        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '3rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛒</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Start shopping and your orders will appear here.</p>
            <Link href="/shop/fish" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((order) => (
              <div key={order.docId} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}>
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.docId ? null : order.docId)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    gap: '1rem', textAlign: 'left',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', margin: '0 0 4px' }}>
                      {order.orderId}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable'}
                      {' · '}
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '999px', background: `${statusColor[order.status] || '#6b7280'}20`,
                      color: statusColor[order.status] || '#6b7280',
                    }}>
                      {statusLabel[order.status] || order.status}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{order.total}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{expandedOrder === order.docId ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Order Details (expandable) */}
                {expandedOrder === order.docId && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.qty}</span>
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        href={`/track?id=${order.orderId}`}
                        className="btn btn-primary"
                        style={{ fontSize: '0.82rem', padding: '6px 16px' }}
                      >
                        Track Order →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Designer Promotion Badge */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(15,76,117,0.06), rgba(16,185,129,0.08))',
          border: '1px solid rgba(15,76,117,0.15)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent)', fontWeight: 700, margin: '0 0 4px' }}>
            🚀 Web & App Designer
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Application Designed & Developed by Sameer Khan
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/917981502973?text=Hi%20Sameer%2C%20I%20saw%20your%20design%20on%20SLNS%20Fresh!"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              💬 WhatsApp: +91 79815 02973
            </a>
            <a
              href="tel:+917981502973"
              style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              📞 Call: +91 79815 02973
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
