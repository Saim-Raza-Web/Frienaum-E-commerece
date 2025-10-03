import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { splitCart, type CartItemInput } from '@/lib/payments';
import { paymentService } from '@/lib/payment-service';
import { OrderStatus, PaymentGateway, Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

type CheckoutRequest = {
  cart: CartItemInput[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    zipCode: string;
    country: string;
  };
  currency: string;
  paymentMethod: 'stripe' | 'paypal';
  returnUrl: string;
};

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      console.error('No token found in cookies');
      return NextResponse.json({ error: 'Unauthorized: No token found' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    const body: CheckoutRequest = await req.json().catch((err) => {
      console.error('Failed to parse JSON body:', err);
      return {} as any;
    });
    const { cart, shippingAddress, currency = 'USD', paymentMethod, returnUrl } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.error('Cart is empty or invalid:', cart);
      return NextResponse.json({ error: 'Cart is empty or invalid' }, { status: 400 });
    }

    if (!shippingAddress) {
      console.error('Shipping address is missing');
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    if (!paymentMethod || !['stripe', 'paypal'].includes(paymentMethod)) {
      console.error('Invalid payment method:', paymentMethod);
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    let split;
    try {
      split = await splitCart(cart);
    } catch (err) {
      console.error('Error splitting cart:', err);
      const response = {
        error: err instanceof Error ? err.message : 'Failed to split cart',
      };
      return NextResponse.json(response, { status: 500 });
    }

    if (!split.subOrders.length) {
      console.error('No valid items in cart after split:', split);
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // Process payment based on the selected method
    let paymentResult;
    const metadata = {
      customerId: userId,
      cartItems: JSON.stringify(cart),
      shippingAddress: JSON.stringify(shippingAddress),
      splitData: JSON.stringify(split),
      currency,
      paymentMethod,
      returnUrl,
    };

    try {
      if (paymentMethod === 'stripe') {
        // Create Stripe payment intent first
        const paymentIntent = await paymentService.createPaymentIntent(
          split.grandTotal,
          currency,
          metadata
        );

        paymentResult = {
          clientSecret: paymentIntent.client_secret,
          requiresAction: paymentIntent.status === 'requires_action',
          paymentIntentId: paymentIntent.id,
        };
      } else if (paymentMethod === 'paypal') {
        // Create PayPal order
        const paypalOrder = await paymentService.createPayPalOrder(
          split.grandTotal,
          currency,
          metadata
        );

        paymentResult = {
          orderId: paypalOrder.id,
          returnUrl,
        };
      }

      return NextResponse.json({
        status: 'PAYMENT_REQUIRED',
        payment: {
          method: paymentMethod,
          ...paymentResult,
        },
        // Include cart and shipping info for order creation after payment
        cartData: {
          cart,
          shippingAddress,
          split,
          currency,
          paymentMethod,
          returnUrl,
        },
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      const anyErr: any = error;
      const raw = anyErr?.raw || anyErr;
      const response = {
        error: anyErr?.message || raw?.message || 'Payment processing failed',
        details: {
          type: raw?.type,
          code: raw?.code,
          decline_code: raw?.decline_code,
          param: raw?.param,
          doc_url: raw?.doc_url,
          requestId: anyErr?.requestId || raw?.requestId || raw?.headers?.['request-id'],
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    const anyErr: any = error;
    const raw = anyErr?.raw || anyErr;
    const response = {
      error: anyErr?.message || raw?.message || 'Failed to process checkout',
      details: {
        type: raw?.type,
        code: raw?.code,
        decline_code: raw?.decline_code,
        param: raw?.param,
        doc_url: raw?.doc_url,
        requestId: anyErr?.requestId || raw?.requestId || raw?.headers?.['request-id'],
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
