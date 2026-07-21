'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, signOut, signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // In-page login form state when guest visits /account
  const [mode, setMode] = useState('choose'); // 'choose' | 'email-login' | 'email-register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Fetch orders for logged-in user
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

  const handleGoogle = async () => {
    setBusy(true); setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || 'Google Sign-In failed');
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'email-login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (e) {
      setError(
        e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : e.code === 'auth/email-already-in-use'
          ? 'Account already exists — try signing in'
          : e.code === 'auth/weak-password'
          ? 'Password must be at least 6 characters'
          : e.message
      );
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading account details...</p>
        </div>
      </div>
    );
  }

  // 🔒 GUEST VIEW: If not logged in, show in-page login box right on /account
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 460, margin: '2rem auto' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 1.75rem',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🦐</div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              My Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Sign in to view your orders, live tracking status, and account details.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#ef4444',
                fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'left',
              }}>
                ⚠️ {error}
              </div>
            )}

            {mode === 'choose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleGoogle}
                  disabled={busy}
                  className="btn btn-secondary"
                  style={{
                    width: '100%', height: 48, justifyContent: 'center',
                    fontWeight: 600, fontSize: '0.95rem', gap: '10px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12s.46 3.8 1.27 5.42l4.01-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  {busy ? 'Connecting to Google...' : 'Continue with Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ padding: '0 10px' }}>OR</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <button
                  onClick={() => setMode('email-login')}
                  className="btn btn-outline"
                  style={{ width: '100%', height: 44, justifyContent: 'center', fontSize: '0.9rem' }}
                >
                  ✉️ Sign In with Email
                </button>

                <button
                  onClick={() => setMode('email-register')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Need an account? Create one
                </button>
              </div>
            )}

            {(mode === 'email-login' || mode === 'email-register') && (
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', textAlign: 'left' }}>
                {mode === 'email-register' && (
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Full Name</label>
                    <input className="form-input" required placeholder="e.g. Ramesh Kumar" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email Address</label>
                  <input type="email" className="form-input" required placeholder="yourname@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Password</label>
                  <input type="password" className="form-input" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={busy} className="btn btn-primary" style={{ width: '100%', height: 44, marginTop: '0.5rem', justifyContent: 'center' }}>
                  {busy ? 'Signing in...' : mode === 'email-register' ? 'Create Account' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('choose'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.25rem' }}
                >
                  ← Back to choices
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 👤 LOGGED-IN VIEW: Full Account Dashboard
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
          flexWrap: 'wrap',
          justify: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {user.displayName || 'Valued Customer'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 6px' }}>
                {user.email || user.phoneNumber || 'Signed in'}
              </p>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                ● Active Customer Account
              </span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--accent-warm)', borderColor: 'rgba(239,68,68,0.3)' }}
          >
            🚪 Sign Out
          </button>
        </div>

        {/* Order History Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            📦 My Orders & Tracking
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Orders list */}
        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            ⏳ Loading your order history...
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '3rem 1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders placed yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Explore our fresh seafood collection and place your first order!
            </p>
            <Link href="/" className="btn btn-primary">
              🐟 Start Shopping →
            </Link>
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
