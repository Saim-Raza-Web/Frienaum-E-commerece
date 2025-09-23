'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { X, Loader2, CheckCircle } from 'lucide-react';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'success';

export default function CheckoutPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
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
      if (!user) {
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
      
      const { orderId } = result;
      setCurrentStep('payment');
      // Store orderId for later use in payment processing
      sessionStorage.setItem('currentOrderId', orderId);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (gateway: 'stripe' | 'paypal') => {
    const orderId = sessionStorage.getItem('currentOrderId');
    if (!orderId) {
      setError('Order not found. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real app, you'd create a payment session with your chosen gateway
      // For demo, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart and show success
      clearCart();
      setCurrentStep('success');
      
      // In a real app, you'd redirect to a success page or show order confirmation
      setTimeout(() => {
        onClose();
        setCurrentStep('cart');
        router.push('/orders');
      }, 3000);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try another method.');
    } finally {
      setIsLoading(false);
    }
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
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment('stripe')}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <img src="/stripe-logo.svg" alt="Stripe" className="h-6 mr-3" />
                    <span>Pay with Stripe</span>
                  </div>
                  {isLoading && <Loader2 className="animate-spin h-5 w-5 text-gray-500" />}
                </button>
                
                <button
                  onClick={() => handlePayment('paypal')}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <img src="/paypal-logo.svg" alt="PayPal" className="h-6 mr-3" />
                    <span>Pay with PayPal</span>
                  </div>
                  {isLoading && <Loader2 className="animate-spin h-5 w-5 text-gray-500" />}
                </button>
              </div>
              
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
