'use client';

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useProducts } from '@/lib/useProducts';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const initialQty = action.qty !== undefined ? action.qty : 0.5;
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, qty: +(i.qty + (action.qty || 0.5)).toFixed(1) } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.product, qty: initialQty }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY':
      if (action.qty < 0.5) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: +action.qty.toFixed(1) } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.items };
    // Sync prices/images from live Firestore without changing qty
    case 'SYNC_PRICES':
      return {
        ...state,
        items: state.items.map((cartItem) => {
          const live = action.liveProducts.find((p) => p.id === cartItem.id);
          if (!live) return cartItem;
          return {
            ...cartItem,
            price: live.price,
            originalPrice: live.originalPrice ?? cartItem.originalPrice,
            image: live.image || cartItem.image,
            inStock: live.inStock ?? cartItem.inStock,
          };
        }),
      };
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

  // Live Firestore product data — used to sync prices on every update
  const { products: liveProducts } = useProducts();

  useEffect(() => {
    // Listen to auth state — load or clear cart when user changes
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      const prevUid = currentUidRef.current;
      const newUid = firebaseUser?.uid || null;

      if (newUid !== prevUid) {
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
          try { localStorage.removeItem('slns_cart'); } catch (_) {}
        }

        currentUidRef.current = newUid;
      }
    });

    return () => unsub();
  }, []);

  // Sync live Firestore prices/images into cart whenever products update
  useEffect(() => {
    if (liveProducts && liveProducts.length > 0 && state.items.length > 0) {
      dispatch({ type: 'SYNC_PRICES', liveProducts });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveProducts]);

  // Persist current user's cart to localStorage whenever it changes
  useEffect(() => {
    const uid = currentUidRef.current;
    if (uid) {
      localStorage.setItem(cartKey(uid), JSON.stringify(state.items));
    }
    // Guests: don't persist (no localStorage save)
  }, [state.items]);


  const addItem = (product, qty) => dispatch({ type: 'ADD_ITEM', product, qty });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const savings = state.items.reduce(
    (sum, i) => sum + ((i.originalPrice || i.price) - i.price) * i.qty,
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
