'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import { isValidLocale, type Locale } from '@/i18n/config';
import { X, Loader2, CheckCircle, CreditCard, Truck, ChevronDown } from 'lucide-react';
import { Address } from '@/types';
import StripePaymentForm from './StripePaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { sortedCountries } from '@/data/countries';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'success';

export default function CheckoutPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, clearCart, cartTotal } = useCart();
  const { translate } = useTranslation();
  const currentLang = pathname?.split('/')[1] || 'de';
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
  }

  const [stripePromise] = useState(() => stripePublishableKey ? loadStripe(stripePublishableKey) : null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    cartData?: any;
  } | null>(null);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Address>>({});

  // Calculate tax and shipping
  const SHIPPING_FLAT_FEE = 8.5;
  const SHIPPING_FREE_THRESHOLD = 50;

  const formatPrice = (amount: number, lang: string) => {
    return `${amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
  };

  const calculateShipping = () => {
    return cartTotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
  };

  const calculateTax = () => {
    const shipping = calculateShipping();
    return (cartTotal + shipping) * 0.081; // 8.1% VAT on subtotal + shipping
  };

  const calculateTotal = () => cartTotal + calculateShipping() + calculateTax();

  // Address validation
  const validateAddress = (): boolean => {
    const errors: Partial<Address> = {};

    if (!shippingAddress.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      errors.email = 'Email is invalid';
    }
    if (!shippingAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingAddress.address.trim()) errors.address = 'Address is required';
    if (!shippingAddress.city.trim()) errors.city = 'City is required';
    if (!shippingAddress.state.trim()) errors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) errors.zipCode = 'ZIP code is required';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle address input changes
  const handleAddressChange = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (addressErrors[field]) {
      setAddressErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Build a minimal, safe shipping address using user data or fallbacks
  const buildMinimalShippingAddress = (): Address => {
    const firstNameFromUser = (user?.firstName || '').trim();
    const lastNameFromUser = (user?.lastName || '').trim();
    const firstName = firstNameFromUser || 'Customer';
    const lastName = lastNameFromUser || 'User';
    return {
      firstName,
      lastName,
      email: user?.email || shippingAddress.email || 'customer@example.com',
      phone: shippingAddress.phone || '0000000000',
      address: shippingAddress.address || 'N/A',
      city: shippingAddress.city || 'N/A',
      state: shippingAddress.state || 'NA',
      zipCode: shippingAddress.zipCode || '00000',
      country: shippingAddress.country || 'United States',
    };
  };

  // One-click proceed to payment: create order immediately with minimal address
  const handleQuickCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsLoading(true);
    setError('');

    try {
      if (!isAuthenticated || !user) {
        throw new Error('You need to be signed in to complete your purchase');
      }

      const minimalAddress = buildMinimalShippingAddress();
      const response = await fetch('/api/checkout/split', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          shippingAddress: minimalAddress,
          paymentMethod: 'stripe',
          amount: calculateTotal(),
          currency: 'CHF',
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to create order (HTTP ${response.status})`;
        const requestId = response.headers.get('request-id') || response.headers.get('Request-Id') || '';
        try {
          const cloned = response.clone();
          const json = await cloned.json();
          const parts: Array<string> = [];

          if (json && typeof json === 'object') {
            // Extract error details from various possible structures
            if (json.error) parts.push(String(json.error));
            if (json.message) parts.push(String(json.message));
            if (json.details?.type) parts.push(String(json.details.type));
            if (json.details?.code) parts.push(String(json.details.code));
            if (json.details?.decline_code) parts.push(String(json.details.decline_code));
            if (json.details?.param) parts.push(String(json.details.param));
            if (json.details?.doc_url) parts.push(String(json.details.doc_url));

            // For Stripe errors, check for specific fields
            if (json.type) parts.push(String(json.type));
            if (json.code) parts.push(String(json.code));
            if (json.param) parts.push(String(json.param));
            if (json.decline_code) parts.push(String(json.decline_code));

            // Log the full error object for debugging
            console.error('API Error Details:', json);
          }

          if (requestId) parts.push(`request-id:${requestId}`);
          if (response.statusText) parts.push(response.statusText);

          if (parts.length > 0) {
            errorMessage = parts.join(' | ');
          } else {
            // Fallback to raw text if JSON had no useful fields
            const text = await response.text();
            if (text) errorMessage = `${errorMessage} | ${text}`;
          }
        } catch (parseError) {
          try {
            const text = await response.text();
            const parts = [errorMessage, text, requestId ? `request-id:${requestId}` : ''].filter(Boolean);
            errorMessage = parts.join(' | ');
            console.error('API Error TEXT:', text);
          } catch (_) {
            // If all parsing fails, use the basic error message
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status !== 'PAYMENT_REQUIRED' || !result.payment?.clientSecret) {
        throw new Error('Invalid response from server');
      }

      // Save payment data for Stripe Elements
      setPaymentData({
        clientSecret: result.payment.clientSecret,
        paymentIntentId: result.payment.paymentIntentId,
        cartData: result.cartData
      });
      setCurrentStep('payment');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.message || 'Failed to process your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle proceed to payment from shipping
  const handleProceedToPaymentFromShipping = async () => {
    if (!validateAddress()) return;

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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingAddress,
          currency: 'CHF',
          paymentMethod: 'stripe',
          // Include the total amount for verification
          amount: calculateTotal(),
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to create order (HTTP ${response.status})`;
        const requestId = response.headers.get('request-id') || response.headers.get('Request-Id') || '';
        try {
          const cloned = response.clone();
          const json = await cloned.json();
          const parts: Array<string> = [];

          if (json && typeof json === 'object') {
            // Extract error details from various possible structures
            if (json.error) parts.push(String(json.error));
            if (json.message) parts.push(String(json.message));
            if (json.details?.type) parts.push(String(json.details.type));
            if (json.details?.code) parts.push(String(json.details.code));
            if (json.details?.decline_code) parts.push(String(json.details.decline_code));
            if (json.details?.param) parts.push(String(json.details.param));
            if (json.details?.doc_url) parts.push(String(json.details.doc_url));

            // For Stripe errors, check for specific fields
            if (json.type) parts.push(String(json.type));
            if (json.code) parts.push(String(json.code));
            if (json.param) parts.push(String(json.param));
            if (json.decline_code) parts.push(String(json.decline_code));

            // Log the full error object for debugging
            console.error('API Error Details:', json);
          }

          if (requestId) parts.push(`request-id:${requestId}`);
          if (response.statusText) parts.push(response.statusText);

          if (parts.length > 0) {
            errorMessage = parts.join(' | ');
          } else {
            // Fallback to raw text if JSON had no useful fields
            const text = await response.text();
            if (text) errorMessage = `${errorMessage} | ${text}`;
          }
        } catch (parseError) {
          try {
            const text = await response.text();
            const parts = [errorMessage, text, requestId ? `request-id:${requestId}` : ''].filter(Boolean);
            errorMessage = parts.join(' | ');
            console.error('API Error TEXT:', text);
          } catch (_) {
            // If all parsing fails, use the basic error message
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.status !== 'PAYMENT_REQUIRED' || !result.payment?.clientSecret) {
        throw new Error('Invalid response from server');
      }

      // Save payment data for Stripe Elements
      setPaymentData({
        clientSecret: result.payment.clientSecret,
        paymentIntentId: result.payment.paymentIntentId,
        cartData: result.cartData
      });

      setCurrentStep('payment');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.message || 'Failed to process your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingAddress,
          currency: 'CHF',
          paymentMethod: 'stripe',
          // Include the total amount for verification
          amount: calculateTotal(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      if (result.status !== 'PAYMENT_REQUIRED' || !result.payment?.clientSecret) {
        throw new Error('Invalid response from server');
      }

      // Save payment data for Stripe Elements
      setPaymentData({
        clientSecret: result.payment.clientSecret,
        paymentIntentId: result.payment.paymentIntentId,
        cartData: result.cartData
      });

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
              {currentStep === 'cart' && translate('cart.orderSummary')}
              {currentStep === 'shipping' && translate('cart.shipping')}
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
                      <p className="text-sm text-gray-600">{translate('ordersPage.quantity')}: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      <span className="font-medium">
                        {formatPrice(item.product.price * item.quantity, currentLang)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>{translate('cart.subtotal')}:</span>
                    <span>{formatPrice(cartTotal, currentLang)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{translate('cart.tax')}:</span>
                    <span>{formatPrice(calculateTax(), currentLang)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{translate('cart.shipping')}:</span>
                    <span>{calculateShipping() === 0 ? translate('cart.free') : formatPrice(calculateShipping(), currentLang)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                    <span>{translate('cart.total')}:</span>
                    <span>{formatPrice(calculateTotal(), currentLang)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStep('shipping')}
                  disabled={cartItems.length === 0 || isLoading}
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
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'shipping' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Shipping Information</h3>
                <div className="space-y-3">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          addressErrors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John"
                        disabled={isLoading}
                      />
                      {addressErrors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{addressErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          addressErrors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Doe"
                        disabled={isLoading}
                      />
                      {addressErrors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{addressErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        addressErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                    {addressErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{addressErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        addressErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                      disabled={isLoading}
                    />
                    {addressErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        addressErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main St"
                      disabled={isLoading}
                    />
                    {addressErrors.address && (
                      <p className="text-red-500 text-xs mt-1">{addressErrors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          addressErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="New York"
                        disabled={isLoading}
                      />
                      {addressErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          addressErrors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="NY"
                        disabled={isLoading}
                      />
                      {addressErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          addressErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="10001"
                        disabled={isLoading}
                      />
                      {addressErrors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">{addressErrors.zipCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <div className="relative">
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
                        disabled={isLoading}
                      >
                        {sortedCountries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('cart')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  ← Back
                </button>
                <button
                  onClick={handleProceedToPaymentFromShipping}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'payment' && paymentData && stripePromise && (
            <div className="space-y-4">
              <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                <StripePaymentForm
                  clientSecret={paymentData.clientSecret}
                  orderId="" // Order will be created after payment
                  amount={Math.round(calculateTotal() * 100)} // Convert to cents
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onLoading={handlePaymentLoading}
                />
              </Elements>

              <button
                onClick={() => setCurrentStep('shipping')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                ← Back to shipping
              </button>
            </div>
          )}

          {currentStep === 'payment' && paymentData && !stripePromise && (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-700 p-4 rounded-md">
                <h3 className="font-medium mb-2">Payment Unavailable</h3>
                <p className="text-sm">
                  Stripe payment system is not properly configured. Please contact support or try again later.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('shipping')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                ← Back to shipping
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