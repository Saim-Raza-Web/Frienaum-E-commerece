'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Trash2, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import dynamic from 'next/dynamic';
import SmartImage from '@/components/SmartImage';

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
  const currentLang = pathname?.split('/')[1] || 'de';

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
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return (subtotal + shipping) * 0.081;
  };

  const SHIPPING_FLAT_FEE = 8.5;
  const SHIPPING_FREE_THRESHOLD = 50;

  const formatPrice = (amount: number, lang: string) => {
    return `${amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
  };

  const calculateShipping = () => {
    return calculateSubtotal() >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <CheckoutPopup 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${currentLang}/products`}
            className="inline-flex items-center text-turquoise-600 hover:text-turquoise-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {translate('cart.continueShopping')}
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{translate('cart.shoppingCart')}</h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16 sm:py-20">
            <div className="text-gray-400 text-5xl sm:text-6xl mb-4">🛒</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{translate('cart.emptyCart')}</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-4">{translate('cart.emptyCartMessage')}</p>
            <Link href={`/${currentLang}/products`} className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              {translate('cart.startShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {translate('cart.cartItems')} ({cartItems.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <div className="relative w-full h-full">
                            <SmartImage
                              src={item.product.images?.[0] || '/images/placeholder-product.png'}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                              fallbackSrc="/images/placeholder-product.png"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                            {(() => {
                              const productKey = `products.${getProductKey(item.product.name)}`;
                              const translatedName = translate(productKey);
                              // If translation returns the key itself (meaning not found), use original name
                              return translatedName === productKey ? item.product.name : translatedName;
                            })()}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">
                            {(() => {
                              const categoryKey = `categories.${item.product.category.toLowerCase()}`;
                              const translatedCategory = translate(categoryKey);
                              // If translation returns the key itself (meaning not found), use original category
                              return translatedCategory === categoryKey ? item.product.category : translatedCategory;
                            })()}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {formatPrice(item.product.price, currentLang)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between sm:justify-start space-x-4 sm:space-x-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 sm:w-8 sm:h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-sm sm:text-base bg-white text-gray-900"
                            >
                              -
                            </button>
                            <span className="w-8 sm:w-12 text-center text-gray-900 font-medium text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 sm:w-8 sm:h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-sm sm:text-base bg-white text-gray-900"
                            >
                              +
                            </button>
                          </div>

                          {/* Item Total - Mobile optimized */}
                          <div className="text-left sm:text-right">
                            <div className="text-base sm:text-lg font-bold text-gray-900">
                              {formatPrice(item.product.price * item.quantity, currentLang)}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-red-600 hover:text-red-700 text-xs sm:text-sm flex items-center mt-1"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              {translate('cart.remove')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-summary-sticky">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{translate('cart.orderSummary')}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>{translate('cart.subtotal')}</span>
                    <span className="font-medium">
                      {formatPrice(calculateSubtotal(), currentLang)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>{translate('cart.tax')}</span>
                    <span className="font-medium">{formatPrice(calculateTax(), currentLang)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                    <span>{translate('cart.shipping')}</span>
                    <span className={`font-medium ${calculateShipping() === 0 ? 'text-green-600' : ''}`}>
                      {calculateShipping() === 0 ? translate('cart.free') : formatPrice(calculateShipping(), currentLang)}
                    </span>
                  </div>

                  {calculateShipping() === 0 && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      🎉 {translate('cart.freeShippingMessage')}
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
                      <span>{translate('cart.total')}</span>
                      <span className="text-xl sm:text-2xl">{formatPrice(calculateTotal(), currentLang)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 sm:py-4 px-4 rounded-lg text-base sm:text-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  disabled={cartItems.length === 0}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{translate('cart.proceedToCheckout')}</span>
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href={`/${currentLang}/products`}
                    className="text-turquoise-600 hover:text-turquoise-700 text-sm sm:text-base font-medium"
                  >
                    {translate('cart.continueShopping')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      {/* Additional CSS for complete cart page responsiveness */}
      <style jsx global>{`
        /* Cart page specific responsive fixes */
        .cart-container {
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* Mobile cart item improvements */
        @media (max-width: 640px) {
          .cart-item-mobile {
            padding: 1rem;
          }

          .cart-quantity-controls {
            width: 100%;
            justify-content: space-between;
          }

          .cart-item-total {
            text-align: left;
            margin-top: 0.5rem;
          }

          /* Ensure buttons don't overflow */
          .cart-checkout-btn {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }

          /* Improve spacing for mobile */
          .cart-spacing {
            margin-bottom: 1rem;
          }
        }

        /* Ensure all text scales properly */
        .cart-text-responsive {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Sticky order summary improvements */
        .order-summary-sticky {
          top: 6rem;
        }

        @media (max-width: 1024px) {
          .order-summary-sticky {
            position: static;
            margin-top: 2rem;
          }
        }

        /* Button responsiveness */
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Image responsiveness */
        .cart-item-image {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }
      `}</style>
    </div>
    </div>
  );
}