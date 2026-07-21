'use client';

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.product, qty: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY':
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

// Cart key scoped per user so each account has its own cart
function cartKey(uid) {
  return uid ? `slns_cart_${uid}` : null;
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const currentUidRef = useRef(null); // track current user UID

  useEffect(() => {
    // Listen to auth state — load or clear cart when user changes
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const prevUid = currentUidRef.current;
      const newUid = firebaseUser?.uid || null;

      if (newUid !== prevUid) {
        // Save old user's cart before switching
        if (prevUid) {
          // Already saved in the persist effect below — nothing to do here
        }

        // Clear cart in memory first
        dispatch({ type: 'CLEAR_CART' });

        if (newUid) {
          // Load the signed-in user's saved cart
          try {
            const saved = localStorage.getItem(cartKey(newUid));
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                dispatch({ type: 'LOAD_CART', items: parsed });
              }
            }
          } catch (_) {}
        } else {
          // User signed out — also clear localStorage (no ghost cart)
          if (prevUid) {
            // Keep the signed-out user's cart saved under their key (restore on next login)
            // but clear the active in-memory cart (already done above)
          }
          // Remove the generic key just in case
          try { localStorage.removeItem('slns_cart'); } catch (_) {}
        }

        currentUidRef.current = newUid;
      }
    });

    return () => unsub();
  }, []);

  // Persist current user's cart to localStorage whenever it changes
  useEffect(() => {
    const uid = currentUidRef.current;
    if (uid) {
      // Save under user-specific key
      localStorage.setItem(cartKey(uid), JSON.stringify(state.items));
    }
    // Guests: don't persist (no localStorage save)
  }, [state.items]);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', product });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const savings = state.items.reduce(
    (sum, i) => sum + (i.originalPrice - i.price) * i.qty,
    0
  );
  const delivery = subtotal > 500 ? 0 : subtotal > 0 ? 49 : 0;
  const total = subtotal + delivery;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        savings,
        delivery,
        total,
        addItem,
        removeItem,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
