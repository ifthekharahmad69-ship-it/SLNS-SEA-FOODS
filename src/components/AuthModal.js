'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, registerWithEmail, loginWithEmail } = useAuth();

  const [tab, setTab] = useState('google'); // 'google' | 'email'
  const [emailMode, setEmailMode] = useState('login'); // 'login' | 'register'

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTab('google');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setError('');
      setSuccess('');
      setLoading(false);
      setEmailMode('login');
    }
  }, [isOpen]);

  const handleError = (err) => {
    const messages = {
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/cancelled-popup-request': 'Another sign-in is in progress.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
      'auth/invalid-email': 'Please enter a valid email address.',
    };
    setError(messages[err.code] || err.message || 'Something went wrong.');
  };

  // ── Google ──────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      setSuccess('Signed in successfully!');
      setTimeout(onClose, 800);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Email/Password ───────────────────────────────────────────────
  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      if (emailMode === 'register') {
        await registerWithEmail(email, password, displayName);
        setSuccess('Account created & signed in!');
      } else {
        await loginWithEmail(email, password);
        setSuccess('Signed in successfully!');
      }
      setTimeout(onClose, 800);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'google', label: '🔵 Google' },
    { key: 'email', label: '📧 Email' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)', zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        width: '100%', maxWidth: 400,
        zIndex: 9999,
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '1.4rem', lineHeight: 1,
            padding: '4px 8px', borderRadius: '6px',
          }}
          aria-label="Close"
        >×</button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🦐</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Welcome to SLNS Fresh
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to track your orders
          </p>
        </div>

        {/* Tab Bar */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '4px', marginBottom: '1.5rem',
        }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: tab === t.key ? 600 : 400,
                fontSize: '0.88rem', transition: 'all 0.2s',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Feedback */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem',
            color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem',
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem',
            color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem',
          }}>✅ {success}</div>
        )}

        {/* ── Google Tab ── */}
        {tab === 'google' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Sign in quickly with your Google account. No password needed.
            </p>
            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%', padding: '13px', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)',
                cursor: loading ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)',
                transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              }}
              id="google-signin-btn"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>or use email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <button
              onClick={() => setTab('email')}
              style={{
                width: '100%', padding: '11px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', background: 'transparent',
                cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              Sign in with Email & Password →
            </button>
          </div>
        )}

        {/* ── Email Tab ── */}
        {tab === 'email' && (
          <form onSubmit={handleEmail}>
            {emailMode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="form-input"
                  style={{ width: '100%' }}
                  id="register-name-input"
                />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-input"
                style={{ width: '100%' }}
                id="email-input"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="form-input"
                style={{ width: '100%' }}
                id="password-input"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginBottom: '1rem' }}
              disabled={loading}
              id="email-submit-btn"
            >
              {loading ? '⏳ Please wait...' : emailMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {emailMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setEmailMode(emailMode === 'login' ? 'register' : 'login'); setError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                {emailMode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
        )}
      </div>
    </>
  );
}
