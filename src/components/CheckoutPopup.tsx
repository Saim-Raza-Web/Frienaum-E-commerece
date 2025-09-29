'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { isValidLocale, type Locale } from '@/i18n/config';
import { X, Loader2, CheckCircle, CreditCard } from 'lucide-react';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'success';

export default function CheckoutPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, clearCart, cartTotal } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate tax and shipping
  const calculateTax = () => cartTotal * 0.08; // 8% tax
  const calculateShipping = () => cartTotal > 50 ? 0 : 5.99; // Free shipping over $50
  const calculateTotal = () => cartTotal + calculateTax() + calculateShipping();

  const handleProceedToPayment = async () => {
    if (cartItems.length === 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call our API to create the order and get payment intent
      if (!isAuthenticated || !user) {
        throw new Error('You need to be signed in to complete your purchase');
      }

      const response = await fetch('/api/checkout/split', {
        method: 'POST',
        credentials: 'include', // This ensures cookies are sent with the request
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cart: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          shippingAddress: '123 Example St, City, Country', // In a real app, collect this from a form
          currency: 'USD',
          paymentMethod: 'stripe',
          // Include the total amount for verification
          amount: calculateTotal()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const result = await response.json();
      if (!result.orderId) {
        throw new Error('Invalid response from server');
      }

      setCurrentStep('payment');
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setCurrentStep('success');
    setTimeout(() => {
      onClose();
      setCurrentStep('cart');
      // Extract current locale from pathname and redirect to localized orders page
      const pathSegments = pathname?.split('/').filter(Boolean) || [];
      const currentLocale = isValidLocale(pathSegments[0]) ? pathSegments[0] : 'en'; // Default to 'en' if no valid locale found
      router.push(`/${currentLocale}/orders`);
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handlePaymentLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {currentStep === 'cart' && 'Review Your Order'}
              {currentStep === 'payment' && 'Select Payment Method'}
              {currentStep === 'success' && 'Order Placed!'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {currentStep === 'cart' && (
            <div>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <h4 className="font-medium">{item.product.name || 'Unnamed Product'}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (8%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping:</span>
                    <span>{calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Payment Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePaymentSuccess}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay ${calculateTotal().toFixed(2)}
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentStep('cart')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                ← Back to cart
              </button>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You'll receive an email confirmation shortly.
              </p>
              <div className="animate-pulse text-sm text-gray-500">
                Redirecting to orders...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
