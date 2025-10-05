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

  // Ensure we only access localStorage on the client
  useEffect(() => {
    setIsClient(true);

    // Load cart from localStorage only on client and when authenticated
    if (isAuthenticated) {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    }
  }, [isAuthenticated]);

  // Clear cart when user logs out
  useEffect(() => {
    if (isClient && !isAuthenticated) {
      setCartItems([]);
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Failed to clear cart from localStorage', error);
      }
    }
  }, [isAuthenticated, isClient]);

  // Save cart to localStorage whenever it changes (only on client and when authenticated)
  useEffect(() => {
    if (!isClient || !isAuthenticated) return;

    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems, isClient, isAuthenticated]);

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
    if (isClient) {
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Failed to clear cart from localStorage', error);
      }
    }
  }, [isClient]);

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
