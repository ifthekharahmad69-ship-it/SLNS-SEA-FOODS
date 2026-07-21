'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthGateModal({ onClose, message = 'Sign in to continue' }) {
  const { signInWithGoogle, loginWithEmail, registerWithEmail, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('choose'); // 'choose' | 'email-login' | 'email-register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    setBusy(true); setError('');
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'email-login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
      onClose();
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
    }
    setBusy(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 9998, backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 1.75rem',
        width: '90%', maxWidth: 400,
        zIndex: 9999,
        boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
        animation: 'slideUpModal 0.25s ease',
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'var(--bg-secondary)', border: 'none',
            width: 30, height: 30, borderRadius: '50%',
            fontSize: '1rem', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Icon + Heading */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🦐</div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
            fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem',
          }}>
            {mode === 'email-register' ? 'Create Account' : 'Sign In'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem',
            fontSize: '0.82rem', color: '#ef4444', marginBottom: '1rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Choose mode */}
        {mode === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', width: '100%', padding: '12px',
                border: '2px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: 'white', color: '#374151', fontWeight: 600,
                fontSize: '0.95rem', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
            </div>

            <button
              onClick={() => setMode('email-login')}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, var(--accent), #1a6fa8)',
                color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
              }}
            >
              📧 Sign In with Email
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              No account?{' '}
              <button
                onClick={() => setMode('email-register')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Create one free
              </button>
            </p>
          </div>
        )}

        {/* Email form */}
        {(mode === 'email-login' || mode === 'email-register') && (
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mode === 'email-register' && (
              <input
                type="text" placeholder="Your name" value={name}
                onChange={(e) => setName(e.target.value)} required
                className="form-input"
              />
            )}
            <input
              type="email" placeholder="Email address" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }} required
              className="form-input"
            />
            <input
              type="password" placeholder="Password (min 6 chars)" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }} required
              className="form-input"
            />
            <button
              type="submit" disabled={busy}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, var(--accent), #1a6fa8)',
                color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                fontWeight: 600, fontSize: '0.95rem', cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? '⏳ Please wait...' : mode === 'email-login' ? '🔐 Sign In' : '🎉 Create Account'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <button type="button" onClick={() => { setMode('choose'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ← Back
              </button>
              <button type="button"
                onClick={() => { setMode(mode === 'email-login' ? 'email-register' : 'email-login'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                {mode === 'email-login' ? 'Create account' : 'Sign in instead'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </>
  );
}
