'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

// Detect mobile browsers — popups are blocked/broken on most mobile browsers
function isMobile() {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enable standard secure local persistence managed directly by Firebase SDK
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Handle redirect result when user returns from Google sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error('Google Redirect Sign-In error:', err);
      });

    // Firebase official secure auth state listener
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ── Secure Google Sign-In ─────────────────────────────────────────
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Try in-page popup first (works on desktop & modern mobile browsers)
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        setUser(result.user);
        return result.user;
      }
    } catch (popupError) {
      // Fallback to redirect if popup is blocked on mobile
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request' || isMobile()) {
        await signInWithRedirect(auth, provider);
      } else {
        throw popupError;
      }
    }
  };

  // ── Secure Email / Password Registration ──────────────────────────
  const registerWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  };

  // ── Secure Email / Password Login ─────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // ── Secure Sign Out ───────────────────────────────────────────────
  const signOut = async () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('slns_user_cached');
      } catch {}
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        registerWithEmail,
        loginWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
