import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { PaymentGateway, PaymentStatus, PayoutStatus } from '@prisma/client';
import Stripe from 'stripe';

// Real Stripe payment service
export class PaymentService {
  private stripe?: Stripe;
  private commissionRate = 0.2; // 20% commission

  constructor() {
    // Defer initialization until first use so env changes are picked up reliably
  }

  private getStripe(): Stripe {
    if (this.stripe) return this.stripe;

    let rawKey = process.env.STRIPE_SECRET_KEY;
    if (!rawKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    // Sanitize common issues
    const trimmed = rawKey.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');

    // Validate obvious mistakes
    if (trimmed.includes('*')) {
      throw new Error('STRIPE_SECRET_KEY appears masked (contains *). Use the full, unmasked key from Stripe.');
    }
    if (!/^sk_(test|live)_/.test(trimmed)) {
      throw new Error('STRIPE_SECRET_KEY has an unexpected format. Expected to start with sk_test_ or sk_live_.');
    }

    this.stripe = new Stripe(trimmed);
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any> = {}) {
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    try {
      return await this.getStripe().paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (err: any) {
      // Re-throw stripe error verbatim so API layer can surface structured details
      throw err;
    }
  }

  async handleSuccessfulPayment(
    paymentIntentId: string,
    orderId: string,
    amount: number,
    currency: string
  ) {
    // Retrieve the payment intent to verify it
    const paymentIntent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not succeeded');
    }

    // Update the order status and create payment record
    const [order, payment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'PENDING' }, // Keep as PENDING after successful payment - merchants will update status
        include: { subOrders: true },
      }),
      prisma.payment.create({
        data: {
          orderId,
          gateway: PaymentGateway.STRIPE,
          status: PaymentStatus.SUCCEEDED,
          amount,
          currency,
          transactionId: paymentIntentId,
          raw: paymentIntent as any,
        },
      }),
    ]);

    // Update merchant balances
    await this.updateMerchantBalances(order);

    return { order, payment };
  }

  async updateMerchantBalances(order: any) {
    if (!order.subOrders || order.subOrders.length === 0) return;

    for (const subOrder of order.subOrders) {
      await prisma.$transaction([
        // Update merchant's available balance
        prisma.payoutBalance.upsert({
          where: { merchantId: subOrder.merchantId },
          update: {
            available: { increment: subOrder.payoutAmount },
            pending: { increment: 0 },
          },
          create: {
            merchantId: subOrder.merchantId,
            available: subOrder.payoutAmount,
            pending: 0,
          },
        }),

        // Create transaction record
        prisma.payoutTransaction.create({
          data: {
            merchantId: subOrder.merchantId,
            amount: subOrder.payoutAmount,
            status: 'PENDING',
            method: 'PLATFORM',
          },
        }),
      ]);
    }
  }

  // PayPal methods - also mocked for testing
  async createPayPalOrder(amount: number, currency: string, metadata: Record<string, any> = {}) {
    // Simulate PayPal order creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: `PAYPAL-${uuidv4()}`, status: 'CREATED' };
  }

  async capturePayPalOrder(orderId: string, amount: number, currency: string) {
    // Simulate PayPal order capture
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { status: 'COMPLETED', id: orderId };
  }
}

export const paymentService = new PaymentService();
