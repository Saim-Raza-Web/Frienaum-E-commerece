'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Trash2, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the CheckoutPopup to avoid SSR issues
const CheckoutPopup = dynamic(
  () => import('@/components/CheckoutPopup'),
  { ssr: false }
);

export default function CartPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    cartTotal
  } = useCart();
  const { translate } = useTranslation();
  const pathname = usePathname();
  const currentLang = pathname?.split('/')[1] || 'en';

  // Helper function to convert product name to kebab-case for translation keys
  const getProductKey = (productName: string) => {
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
  };

  useEffect(() => {
    // Set loading to false once cart is loaded
    setIsLoading(false);
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 50 ? 0 : 5.99; // Free shipping over $50
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };
  
  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{translate('cart.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutPopup 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${currentLang}/products`}
            className="inline-flex items-center text-turquoise-600 hover:text-turquoise-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {translate('cart.continueShopping')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{translate('cart.shoppingCart')}</h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{translate('cart.emptyCart')}</h2>
            <p className="text-gray-600 mb-8">{translate('cart.emptyCartMessage')}</p>
            <Link href={`/${currentLang}/products`} className="btn-primary text-lg px-8 py-3">
              {translate('cart.startShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {translate('cart.cartItems')} ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {(() => {
                              const productKey = `products.${getProductKey(item.product.name)}`;
                              const translatedName = translate(productKey);
                              // If translation returns the key itself (meaning not found), use original name
                              return translatedName === productKey ? item.product.name : translatedName;
                            })()}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {(() => {
                              const categoryKey = `categories.${item.product.category.toLowerCase()}`;
                              const translatedCategory = translate(categoryKey);
                              // If translation returns the key itself (meaning not found), use original category
                              return translatedCategory === categoryKey ? item.product.category : translatedCategory;
                            })()}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ${item.product.price.toFixed(2)}
                            </span>
                            {item.product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-gray-900 font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center mt-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {translate('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('cart.orderSummary')}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{translate('cart.subtotal')}</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{translate('cart.tax')}</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{translate('cart.shipping')}</span>
                    <span className={calculateShipping() === 0 ? 'text-green-600' : ''}>
                      {calculateShipping() === 0 ? translate('cart.free') : `$${calculateShipping().toFixed(2)}`}
                    </span>
                  </div>

                  {calculateShipping() === 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      🎉 {translate('cart.freeShippingMessage')}
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>{translate('cart.total')}</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg text-lg font-medium flex items-center justify-center space-x-2"
                  disabled={cartItems.length === 0}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{translate('cart.proceedToCheckout')}</span>
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href={`/${currentLang}/products`}
                    className="text-turquoise-600 hover:text-turquoise-700 text-sm"
                  >
                    {translate('cart.continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}