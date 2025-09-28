'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Loader2, CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

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
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found.');
      return;
    }

    onLoading(true);
    setCardError(null);

    try {
      // For mock payments, we'll simulate a successful payment
      // In a real app, this would call stripe.confirmCardPayment

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;

      // Confirm the payment on our backend
      const response = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: mockPaymentIntentId,
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to confirm payment');
      }

      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      onError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      onLoading(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-sm mt-1">{cardError}</p>
        )}
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span>Total Amount:</span>
          <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <CreditCard className="w-5 h-5" />
        <span>Pay ${(amount / 100).toFixed(2)}</span>
      </button>
    </form>
  );
}
