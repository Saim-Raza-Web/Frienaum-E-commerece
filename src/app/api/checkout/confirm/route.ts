import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payment-service';
import { verifyToken } from '@/lib/auth';
import { OrderStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail, sendOrderNotificationToMerchant } from '@/lib/email';
import { notifyMerchantOrderPlaced } from '@/lib/notifications';

type SplitSubOrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

type SplitSubOrder = {
  merchantId: string;
  subtotal: number;
  commission: number;
  payoutAmount: number;
  items: SplitSubOrderItem[];
};

type SplitMetadata = {
  subOrders?: SplitSubOrder[];
  grandTotal?: number | string;
};

const orderInclude = {
  subOrders: {
    include: {
      items: {
        include: { product: true },
      },
      merchant: {
        include: { user: true },
      },
    },
  },
};

const retryableErrorCodes = new Set(['P2034']);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;
    const body = await req.json().catch(() => ({} as any));
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 });
    }

    const stripe = paymentService['getStripe']();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not succeeded' }, { status: 400 });
    }

    const metadata = paymentIntent.metadata || {};
    const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : {};
    const splitData: SplitMetadata = metadata.splitData ? JSON.parse(metadata.splitData) : {};
    const currency = metadata.currency || paymentIntent.currency?.toUpperCase() || 'CHF';
    const subOrders: SplitSubOrder[] = Array.isArray(splitData.subOrders) ? splitData.subOrders : [];

    if (!subOrders.length) {
      return NextResponse.json({ error: 'Missing split order data' }, { status: 400 });
    }

    const normalizedShipping = {
      firstName: shippingAddress.firstName || 'Customer',
      lastName: shippingAddress.lastName || 'User',
      email: shippingAddress.email || payload.email,
      phone: shippingAddress.phone || '',
      address: shippingAddress.address || '',
      city: shippingAddress.city || '',
      state: shippingAddress.state || '',
      zipCode: shippingAddress.zipCode || '',
      country: shippingAddress.country || 'Switzerland',
    };

    await ensureTermsAcceptance(userId, req);

    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntentId },
      include: { order: { include: orderInclude } },
    });

    if (existingPayment?.order) {
      await sendOrderEmailsIfNeeded(existingPayment.order, normalizedShipping);

      return NextResponse.json({
        success: true,
        order: existingPayment.order,
        payment: {
          id: paymentIntentId,
          status: 'succeeded',
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    }

    const createResult = await runWithRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const paymentRecord = await tx.payment.findFirst({
          where: { transactionId: paymentIntentId },
          include: { order: { include: orderInclude } },
        });

        if (paymentRecord?.order) {
          return { order: paymentRecord.order, alreadyProcessed: true };
        }

        const address = await tx.address.create({
          data: {
            userId,
            name: `${normalizedShipping.firstName} ${normalizedShipping.lastName}`.trim(),
            phone: normalizedShipping.phone,
            line1: normalizedShipping.address,
            city: normalizedShipping.city,
            state: normalizedShipping.state,
            postalCode: normalizedShipping.zipCode,
            country: normalizedShipping.country,
          },
        });

        const formattedShippingAddress = `${normalizedShipping.firstName} ${normalizedShipping.lastName}, ${normalizedShipping.address}, ${normalizedShipping.city}, ${normalizedShipping.state} ${normalizedShipping.zipCode}, ${normalizedShipping.country}`;
        const grandTotal = Number(splitData.grandTotal) || paymentIntent.amount_received / 100;
        const gateway = metadata.paymentMethod === 'paypal' ? 'PAYPAL' : 'STRIPE';

        const order = await tx.order.create({
          data: {
            customerId: userId,
            merchantId: subOrders[0]?.merchantId || '',
            status: OrderStatus.PENDING,
            totalAmount: grandTotal,
            shippingAddress: formattedShippingAddress,
            shippingAddressId: address.id,
            grandTotal,
            currency,
            gatewayUsed: gateway,
            paymentStatus: 'SUCCEEDED',
            emailNotificationsSent: false,
          },
        });

        // Pre-fetch all products to validate before transaction
        const allProductIds = subOrders.flatMap((so) => so.items.map((item) => item.productId));
        const products = await tx.product.findMany({
          where: { id: { in: allProductIds } },
          select: { id: true }
        });
        const productIdsSet = new Set(products.map(p => p.id));
        
        // Validate all products exist
        for (const productId of allProductIds) {
          if (!productIdsSet.has(productId)) {
            throw new Error(`Product not found: ${productId}`);
          }
        }

        // Collect all order items for batch insert
        const allOrderItems: any[] = [];

        for (const so of subOrders) {
          const subOrder = await tx.subOrder.create({
            data: {
              orderId: order.id,
              merchantId: so.merchantId,
              subtotal: so.subtotal,
              commission: so.commission,
              payoutAmount: so.payoutAmount,
              status: 'PENDING',
            },
          });

          // Collect order items for this subOrder
          for (const item of so.items) {
            allOrderItems.push({
              subOrderId: subOrder.id,
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            });
          }

          const balance = await tx.payoutBalance.findUnique({
            where: { merchantId: so.merchantId },
          });

          if (balance) {
            await tx.payoutBalance.update({
              where: { merchantId: so.merchantId },
              data: { available: { increment: so.payoutAmount } },
            });
          } else {
            await tx.payoutBalance.create({
              data: {
                merchantId: so.merchantId,
                available: so.payoutAmount,
                pending: 0,
              },
            });
          }

          await tx.payoutTransaction.create({
            data: {
              merchantId: so.merchantId,
              amount: so.payoutAmount,
              status: 'PENDING',
              method: 'PLATFORM',
            },
          });
        }

        // Batch insert all order items at once (much faster)
        if (allOrderItems.length > 0) {
          await tx.orderItem.createMany({
            data: allOrderItems,
          });
        }

        await tx.payment.create({
          data: {
            orderId: order.id,
            gateway,
            status: 'SUCCEEDED',
            amount: grandTotal,
            currency,
            transactionId: paymentIntentId,
            raw: paymentIntent as any,
          },
        });

        const orderWithDetails = await tx.order.findUnique({
          where: { id: order.id },
          include: orderInclude,
        });

        return { order: orderWithDetails, alreadyProcessed: false };
      }, {
        maxWait: 10000, // Maximum time to wait for a transaction slot (10 seconds)
        timeout: 15000, // Maximum time the transaction can run (15 seconds)
      });
    });

    if (!createResult?.order) {
      throw new Error('Failed to create order');
    }

    await sendOrderEmailsIfNeeded(createResult.order, normalizedShipping);

    return NextResponse.json({
      success: true,
      order: createResult.order,
      payment: {
        id: paymentIntentId,
        status: 'succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Payment confirmation failed' }, { status: 500 });
  }
}

async function ensureTermsAcceptance(userId: string, req: NextRequest) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { termsAccepted: true },
  });

  if (user?.termsAccepted) return;

  const currentTerms = await prisma.termsVersion.findFirst({
    where: { isActive: true },
    orderBy: { effectiveDate: 'desc' },
  });

  if (!currentTerms) return;

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  await prisma.user.update({
    where: { id: userId },
    data: {
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      termsAcceptedVersion: currentTerms.version,
      termsAcceptedIP: ip,
    },
  });
}

async function runWithRetry<T>(operation: () => Promise<T>, attempts = 3, baseDelayMs = 150): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        retryableErrorCodes.has(error.code || '');

      if (!isRetryable || attempt === attempts) {
        throw error;
      }

      const delay = baseDelayMs * attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry attempts exceeded');
}

async function sendOrderEmailsIfNeeded(order: any, shippingAddress: any) {
  if (order.emailNotificationsSent) {
    return;
  }

  try {
    if (shippingAddress.email) {
      await sendOrderConfirmationEmail(
        shippingAddress.email,
        `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        {
          orderId: order.id,
          totalAmount: order.grandTotal,
          currency: order.currency,
          items: order.subOrders.flatMap((subOrder: any) =>
            subOrder.items.map((item: any) => ({
              productTitle: item.product.title_en,
              quantity: item.quantity,
              price: item.price,
            }))
          ),
        }
      );
    }

    await Promise.all(
      order.subOrders.map(async (subOrder: any) => {
        const merchantUser = subOrder?.merchant?.user;
        if (!merchantUser) return;

        if (merchantUser.email) {
          await sendOrderNotificationToMerchant(
            merchantUser.email,
            merchantUser.name,
            {
              orderId: order.id,
              customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
              customerEmail: shippingAddress.email,
              totalAmount: subOrder.subtotal,
              currency: order.currency,
              items: subOrder.items.map((item: any) => ({
                productTitle: item.product.title_en,
                quantity: item.quantity,
                price: item.price,
              })),
            }
          );
        }

        if (merchantUser.id) {
          await notifyMerchantOrderPlaced(
            merchantUser.id,
            order.id,
            `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
            subOrder.subtotal,
            order.currency
          );
        }
      })
    );

    await prisma.order.update({
      where: { id: order.id },
      data: { emailNotificationsSent: true },
    });
  } catch (error) {
    console.error('Error sending order emails:', error);
  }
}
