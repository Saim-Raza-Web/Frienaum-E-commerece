import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { PaymentGateway, PaymentStatus, PayoutStatus } from '@prisma/client';

export class PaymentService {
  private stripe: Stripe;
  private commissionRate = 0.2; // 20% commission

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any> = {}) {
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    return this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async handleSuccessfulPayment(
    paymentIntentId: string,
    orderId: string,
    amount: number,
    currency: string
  ) {
    // Verify the payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not succeeded');
    }

    // Update the order status and create payment record
    const [order, payment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' as any }, // Cast to any to bypass type checking
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

  private async updateMerchantBalances(order: any) {
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

  // PayPal methods would be implemented similarly
  async createPayPalOrder(amount: number, currency: string, metadata: Record<string, any> = {}) {
    // Implementation for PayPal order creation
    // This would call the PayPal API
    return { id: `PAYPAL-${uuidv4()}` };
  }

  async capturePayPalOrder(orderId: string, amount: number, currency: string) {
    // Implementation for PayPal order capture
    // This would call the PayPal API
    return { status: 'COMPLETED', id: orderId };
  }
}

export const paymentService = new PaymentService();
