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
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('slns_user_cached');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('slns_user_cached')) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    // Enforce permanent login persistence across sessions
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // Handle redirect result when user comes back from Google sign-in page
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          try {
            localStorage.setItem('slns_user_cached', JSON.stringify({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL,
            }));
          } catch {}
        }
      })
      .catch(() => {});

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        try {
          localStorage.setItem('slns_user_cached', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }));
        } catch {}
      } else {
        try { localStorage.removeItem('slns_user_cached'); } catch {}
      }
    });
    return () => unsub();
  }, []);

  // ── Google Sign-In ──────────────────────────────────────────────
  // Seamless 1-tap Google login
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    if (isMobile()) {
      await signInWithRedirect(auth, provider);
      return;
    } else {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        try {
          localStorage.setItem('slns_user_cached', JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          }));
        } catch {}
      }
      return result.user;
    }
  };

  // ── Email / Password ────────────────────────────────────────────
  const registerWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    if (result?.user) {
      try {
        localStorage.setItem('slns_user_cached', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: displayName || result.user.displayName,
          photoURL: result.user.photoURL,
        }));
      } catch {}
    }
    return result.user;
  };

  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result?.user) {
      try {
        localStorage.setItem('slns_user_cached', JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }));
      } catch {}
    }
    return result.user;
  };

  // ── Sign Out ────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      localStorage.removeItem('slns_user_cached');
      localStorage.removeItem('slns_guest_prompt_dismissed');
    } catch {}
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
