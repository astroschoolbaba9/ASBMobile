// mobile-app/src/context/CartContext.tsx
// Universal Global Cart Context with Expo SecureStore / LocalStorage Persistence & Backend Sync

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { crystalApi, getImageUrl } from '../api/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  mrp: number;
  qty: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  loading: boolean;
  addToCart: (product: any, quantity?: number) => Promise<void>;
  updateQty: (productId: string, delta: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CART_STORAGE_KEY = 'asb_guest_cart';

async function getGuestCartStorage(): Promise<CartItem[]> {
  try {
    if (Platform.OS === 'web') {
      const item = typeof window !== 'undefined' ? localStorage.getItem(CART_STORAGE_KEY) : null;
      return item ? JSON.parse(item) : [];
    } else {
      const item = await SecureStore.getItemAsync(CART_STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    }
  } catch (e) {
    return [];
  }
}

async function setGuestCartStorage(items: CartItem[]): Promise<void> {
  try {
    const val = JSON.stringify(items);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(CART_STORAGE_KEY, val);
    } else {
      await SecureStore.setItemAsync(CART_STORAGE_KEY, val);
    }
  } catch (e) {
    console.warn('Failed to write guest cart:', e);
  }
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Load Local Guest Cart
  const loadLocalCart = useCallback(async () => {
    try {
      const stored = await getGuestCartStorage();
      setCartItems(stored);
    } catch (e) {
      console.warn('Failed to load local cart:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Server Cart for Authenticated Users
  const fetchServerCart = useCallback(async () => {
    try {
      const res = await crystalApi.get('/api/cart');
      if (res.data && Array.isArray(res.data.items)) {
        const mapped: CartItem[] = res.data.items.map((item: any) => ({
          id: item._id || item.productId?._id || item.productId,
          productId: item.productId?._id || item.productId || item.id,
          title: item.title || item.productId?.title || item.productId?.name || 'Spiritual Item',
          price: item.price || item.productId?.price || 999,
          mrp: item.mrp || item.productId?.mrp || 1499,
          qty: item.quantity || item.qty || 1,
          image: getImageUrl(item.image || item.productId?.images?.[0] || item.productId?.image),
        }));
        setCartItems(mapped);
      }
    } catch (e) {
      console.warn('Server cart fetch failed, maintaining current state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchCart = useCallback(async () => {
    if (isAuthenticated) {
      await fetchServerCart();
    } else {
      await loadLocalCart();
    }
  }, [isAuthenticated, fetchServerCart, loadLocalCart]);

  useEffect(() => {
    refetchCart();
  }, [refetchCart]);

  const addToCart = async (product: any, quantity: number = 1) => {
    const prodId = product._id || product.id || product.productId;
    const title = product.title || product.name || 'Spiritual Remedy';
    const price = product.price || 999;
    const mrp = product.mrp || Math.round(price * 1.3);
    const image = getImageUrl(product.image || product.images?.[0]);

    if (isAuthenticated) {
      try {
        await crystalApi.post('/api/cart/items', { productId: prodId, quantity });
        await fetchServerCart();
        return;
      } catch (e) {
        console.warn('Server add to cart failed, updating local state:', e);
      }
    }

    // Local cart fallback
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === prodId);
      let updated: CartItem[];
      if (existingIdx > -1) {
        updated = prev.map((item, idx) =>
          idx === existingIdx ? { ...item, qty: item.qty + quantity } : item
        );
      } else {
        updated = [...prev, { id: prodId, productId: prodId, title, price, mrp, qty: quantity, image }];
      }
      setGuestCartStorage(updated);
      return updated;
    });
  };

  const updateQty = async (productId: string, delta: number) => {
    if (isAuthenticated) {
      try {
        await crystalApi.post('/api/cart/items', { productId, quantity: delta });
        await fetchServerCart();
        return;
      } catch (e) {
        console.warn('Server cart qty update failed:', e);
      }
    }

    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item.productId === productId || item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      setGuestCartStorage(updated);
      return updated;
    });
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        await crystalApi.delete(`/api/cart/items/${productId}`);
        await fetchServerCart();
        return;
      } catch (e) {
        console.warn('Server cart item delete failed:', e);
      }
    }

    setCartItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId && i.id !== productId);
      setGuestCartStorage(updated);
      return updated;
    });
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await crystalApi.delete('/api/cart');
      } catch (e) {
        console.warn('Clear server cart failed:', e);
      }
    }
    setCartItems([]);
    await setGuestCartStorage([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        loading,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        refetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
