'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [storageKey, setStorageKey] = useState<string>('cart_guest');

  const resolveStorageKey = () => (user?.id ? `cart_${user.id}` : 'cart_guest');

  // Ensure we only access localStorage on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update storage key when auth state changes, and migrate guest cart if needed
  useEffect(() => {
    if (!isClient) return;

    const newKey = resolveStorageKey();

    if (user?.id) {
      try {
        const guestCart = localStorage.getItem('cart_guest');
        const existingUserCart = localStorage.getItem(newKey);
        if (guestCart && (!existingUserCart || existingUserCart === '[]')) {
          localStorage.setItem(newKey, guestCart);
        }
      } catch (error) {
        console.error('Failed to migrate guest cart to user cart', error);
      }
    }

    setStorageKey(newKey);
  }, [user?.id, isClient]);

  // Load cart whenever the storage key changes
  useEffect(() => {
    if (!isClient || !storageKey) return;

    try {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      localStorage.removeItem(storageKey);
      setCartItems([]);
    }
  }, [storageKey, isClient]);

  // Save cart to localStorage whenever it changes (only on client)
  useEffect(() => {
    if (!isClient || !storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems, isClient, storageKey]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      // Check if the product is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Create a new array to avoid direct state mutation
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      }
      
      // Add new item to cart
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (isClient && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify([]));
      } catch (error) {
        console.error('Failed to clear cart from localStorage', error);
      }
    }
  }, [isClient, storageKey]);

  // Calculate total items in cart
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
