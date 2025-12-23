'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/UnifiedNavbar';
import Footer from '@/components/Footer';
import { Address } from '@/types';
import { ArrowLeft, CreditCard, Lock, Truck, CheckCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/i18n/TranslationProvider';
import MerchantBlocker from '@/components/MerchantBlocker';

const StripePaymentForm = dynamic(() => import('@/components/StripePaymentForm'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse min-h-[280px]" />
  )
});

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

type CheckoutStep = 'shipping' | 'payment' | 'success';

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const { currentLocale, translate } = useTranslation();

  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState<Partial<Address & { terms?: string }>>({});
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    paymentIntentId: string;
    cartData: any;
  } | null>(null);

  const SHIPPING_FLAT_FEE = 8.5;
  const SHIPPING_FREE_THRESHOLD = 50;
  const CURRENCY = 'CHF';

  const formatPrice = (amount: number, lang: string) => {
    return `${amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
  };

  const calculateTax = () => {
    const shipping = calculateShipping();
    return (cartTotal + shipping) * 0.081;
  };
  const calculateShipping = () => {
    // Calculate shipping based on products in cart
    let totalShipping = 0;
    cartItems.forEach(item => {
      // Use custom shipping cost if set, otherwise use default
      const shippingCost = item.product.shippingCost && item.product.shippingCost > 0
        ? item.product.shippingCost
        : SHIPPING_FLAT_FEE;
      totalShipping += shippingCost * item.quantity;
    });

    // Apply free shipping threshold (if total cart value >= threshold, make shipping free)
    return cartTotal >= SHIPPING_FREE_THRESHOLD ? 0 : totalShipping;
  };
  const total = cartTotal + calculateShipping() + calculateTax();

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Address & { terms?: string }> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!agreeToTerms) newErrors.terms = translate('termsAcceptanceRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!isAuthenticated || !user) {
      setError('You need to be signed in to complete your purchase');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/checkout/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cart: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          shippingAddress: formData,
          currency: CURRENCY,
          paymentMethod: 'stripe',
          amount: total,
        }),
      });
      if (!response.ok) {
        let errorText = '';
        try {
          const cloned = response.clone();
          const json = await cloned.json();
          errorText = json?.error || '';
          console.error('API Error JSON:', json);
        } catch (_) {
          try {
            const text = await response.text();
            errorText = text;
            console.error('API Error TEXT:', text);
          } catch (_) {}
        }
        throw new Error(errorText || `Failed to create order (HTTP ${response.status})`);
      }
      const result = await response.json();
      if (result.status !== 'PAYMENT_REQUIRED' || !result.payment?.clientSecret) {
        throw new Error('Invalid response from server');
      }
      setPaymentData({
        clientSecret: result.payment.clientSecret,
        paymentIntentId: result.payment.paymentIntentId,
        cartData: result.cartData,
      });
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to process your order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };
  const handlePaymentError = (err: string) => setError(err);
  const handlePaymentLoading = (loading: boolean) => setIsLoading(loading);

  return (
    <MerchantBlocker>
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-turquoise-600 hover:text-turquoise-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {translate('checkout.backToCart')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{translate('checkout.title')}</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
              {step === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{translate('checkout.personalInfo')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.firstNameLabel')}</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                          placeholder={translate('checkout.form.firstNamePlaceholder') || 'John'}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.lastNameLabel')}</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                          placeholder={translate('checkout.form.lastNamePlaceholder') || 'Doe'}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.emailLabel')}</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                          placeholder={translate('checkout.form.emailPlaceholder') || 'john@example.com'}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.phoneLabel')}</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                          placeholder={translate('checkout.form.phonePlaceholder') || '(555) 123-4567'}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{translate('checkout.shippingAddress')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.addressLabel')}</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                          placeholder={translate('checkout.form.addressPlaceholder') || '123 Main St'}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.cityLabel')}</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                            placeholder={translate('checkout.form.cityPlaceholder') || 'New York'}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.stateLabel')}</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                            placeholder={translate('checkout.form.statePlaceholder') || 'NY'}
                          />
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.zipCodeLabel')}</label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className={`input-field ${errors.zipCode ? 'border-red-500' : ''}`}
                            placeholder={translate('checkout.form.zipCodePlaceholder') || '10001'}
                          />
                          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{translate('checkout.form.countryLabel')}</label>
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="input-field"
                        >
                          <option value="United States">{translate('checkout.countries.unitedStates')}</option>
                          <option value="Canada">{translate('checkout.countries.canada')}</option>
                          <option value="United Kingdom">{translate('checkout.countries.unitedKingdom')}</option>
                          <option value="Germany">{translate('checkout.countries.germany')}</option>
                          <option value="France">{translate('checkout.countries.france')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Acceptance */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="checkout-terms"
                        checked={agreeToTerms || false}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-warm focus:ring-primary-warm border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="checkout-terms" className="text-sm text-gray-700">
                        {translate('checkout.termsLabelPrefix')}{' '}
                        <Link href={`/${currentLocale}/terms`} className="text-primary-warm hover:text-primary-warm-hover underline">
                          {translate('checkout.termsOfService')}
                        </Link>{' '}
                        {translate('checkout.and')}{' '}
                        <Link href={`/${currentLocale}/privacy`} className="text-primary-warm hover:text-primary-warm-hover underline">
                          {translate('checkout.privacyPolicy')}
                        </Link>
                        {' '}{translate('checkout.termsSuffix')}
                      </label>
                    </div>

                    {errors.terms && (
                      <p className="text-red-600 text-sm">{errors.terms}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !agreeToTerms}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? translate('checkout.processing') || translate('processing') : translate('checkout.proceedToPayment')}
                  </button>
                </form>
              )}

              {step === 'payment' && paymentData && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
                  <Suspense fallback={<div className="rounded-lg border border-gray-200 bg-white p-6 animate-pulse min-h-[280px]" />}>
                    <StripePaymentForm
                      clientSecret={paymentData.clientSecret}
                      orderId="" // Order will be created after payment
                      amount={Math.round(total * 100)}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onLoading={handlePaymentLoading}
                    />
                  </Suspense>
                </Elements>
              )}

              {step === 'payment' && paymentData && !stripePromise && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                  <h3 className="font-medium mb-2">{translate('checkout.paymentUnavailableTitle')}</h3>
                  <p className="text-sm">
                    {translate('checkout.paymentUnavailableMessage')}
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{translate('checkout.successTitle')}</h3>
                  <p className="text-gray-600 mb-6">{translate('checkout.successMessage')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('checkout.orderSummary')}</h2>
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                    <span className="text-gray-900">{formatPrice(item.product.price * item.quantity, currentLocale)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>{translate('checkout.subtotal')}</span>
                  <span>{formatPrice(cartTotal, currentLocale)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{translate('cart.tax')}</span>
                  <span>{formatPrice(calculateTax(), currentLocale)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{translate('checkout.shipping')}</span>
                  <span className={calculateShipping() === 0 ? 'text-green-600' : ''}>
                    {calculateShipping() === 0 ? translate('checkout.free') : formatPrice(calculateShipping(), currentLocale)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{translate('checkout.total')}</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(total, currentLocale)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </MerchantBlocker>
  );
} 