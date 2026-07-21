'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGateModal from '@/components/AuthGateModal';

export default function GuestPrompt() {
  const { user, loading } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // If logged in, loading, or user dismissed the prompt, do nothing
    if (loading || user || dismissed) {
      setShowToast(false);
      return;
    }

    // Every 20 seconds, show the toast for 6 seconds
    const interval = setInterval(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }, 20000);

    // Initial show after 10s
    const initial = setTimeout(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, [user, loading, dismissed]);

  if (loading || user) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: showToast ? '85px' : '-100px', // floats just above the mobile nav
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--bg-card)',
        padding: '10px 14px',
        borderRadius: '99px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // bouncy slide up
        zIndex: 9900,
        width: 'max-content',
        maxWidth: '92vw',
      }}>
        <span style={{ fontSize: '1.2rem' }}>👋</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          Sign in for a better experience!
        </span>
        <button
          onClick={() => { setShowToast(false); setShowAuth(true); }}
          style={{
            background: 'linear-gradient(135deg, var(--accent), #1a6fa8)',
            color: 'white', border: 'none',
            padding: '6px 14px', borderRadius: '99px', fontSize: '0.8rem',
            fontWeight: 700, cursor: 'pointer', flexShrink: 0
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => { setShowToast(false); setDismissed(true); }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '1rem', cursor: 'pointer', padding: '0 4px', flexShrink: 0
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {showAuth && (
        <AuthGateModal
          message="Sign in to track orders, save favorites, and more!"
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
