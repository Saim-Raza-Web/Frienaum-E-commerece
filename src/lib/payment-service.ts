import { v4 as uuidv4 } from 'uuid';
import { prisma } from './prisma';
import { PaymentGateway, PaymentStatus, PayoutStatus } from '@prisma/client';

// Mock payment service for testing - no real API keys required
export class PaymentService {
  private stripe: any; // Mock Stripe instance
  private commissionRate = 0.2; // 20% commission

  constructor() {
    // Mock Stripe - no real API key needed for testing
    this.stripe = {
      paymentIntents: {
        create: async (params: any) => {
          // Simulate Stripe payment intent creation
          return {
            id: `pi_mock_${uuidv4()}`,
            client_secret: `pi_mock_${uuidv4()}_secret_${uuidv4()}`,
            amount: params.amount,
            currency: params.currency,
            status: 'requires_payment_method',
            metadata: params.metadata,
          };
        },
        retrieve: async (paymentIntentId: string) => {
          // Simulate Stripe payment intent retrieval
          return {
            id: paymentIntentId,
            status: 'succeeded',
            amount: 1000, // Mock amount
            currency: 'usd',
            metadata: {},
          };
        },
      },
    };
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any> = {}) {
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    // Mock payment verification
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
