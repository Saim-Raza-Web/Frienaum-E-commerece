'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { sampleProducts } from '@/data/sampleProducts';

export default function TestCartPage() {
  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitialized.current) return;
    
    // Set up test cart only once
    const setupTestCart = async () => {
      try {
        // Clear cart first
        await clearCart();
        
        // Add test products
        addToCart(sampleProducts[0], 2); // 2x Headphones
        addToCart(sampleProducts[1], 1); // 1x T-Shirt
        
        // Mark as initialized
        isInitialized.current = true;
        
        // Navigate to cart after a short delay
        setTimeout(() => {
          router.push('/en/cart');
        }, 100);
      } catch (error) {
        console.error('Error setting up test cart:', error);
      }
    };

    setupTestCart();
  }, [isClient, addToCart, clearCart, router]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Preparing your test cart...</p>
      </div>
    </div>
  );
}
