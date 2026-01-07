'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function StripePaymentForm({
  clientSecret,
  orderId,
  amount,
  onSuccess,
  onError,
  onLoading,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Return URL used if 3DS or other next actions are required
  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    // Redirect back to the current page; component will auto-complete after return
    return window.location.href;
  }, []);

  // If we arrived back from a redirect, finish the flow by checking PI status
  useEffect(() => {
    let isMounted = true;
    const finalizeIfSucceeded = async () => {
      if (!stripe || !clientSecret) return;
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          onLoading(true);
          const response = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to confirm payment');
          }
          if (!isMounted) return;
          onSuccess();
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(err?.message || 'Failed to finalize payment');
        onError(err?.message || 'Failed to finalize payment');
      } finally {
        onLoading(false);
      }
    };
    void finalizeIfSucceeded();
    return () => {
      isMounted = false;
    };
  }, [stripe, clientSecret, orderId, onSuccess, onError, onLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      onError('Stripe is not ready yet.');
      return;
    }

    onLoading(true);
    setErrorMessage(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: returnUrl ? { return_url: returnUrl } : undefined,
        redirect: 'if_required',
      });

      if (error) {
        const message = error.message || 'Payment failed';
        setErrorMessage(message);
        onError(message);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const response = await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to confirm payment');
        }
        onSuccess();
      } else {
        // If redirect occurred, the effect above will handle finalization after return
      }
    } catch (err: any) {
      const message = err?.message || 'Payment failed';
      setErrorMessage(message);
      onError(message);
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Payment details</label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>
        {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span>Total Amount:</span>
          <span className="font-semibold">{(amount / 100).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <CreditCard className="w-5 h-5" />
        <span>Pay {(amount / 100).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF</span>
      </button>
    </form>
  );
}
