import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payment-service';
import { verifyToken } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail, sendOrderNotificationToMerchant } from '@/lib/email';
import { sendOrderConfirmationToCustomer, sendNewOrderNotificationToMerchant } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    const body = await req.json().catch(() => ({} as any));
    const { paymentIntentId, orderId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to verify it and get metadata
    const stripe = paymentService['getStripe']();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not succeeded' },
        { status: 400 }
      );
    }

    // Extract metadata from payment intent
    const metadata = paymentIntent.metadata || {};
    const cartItems = metadata.cartItems ? JSON.parse(metadata.cartItems) : [];
    const shippingAddress = metadata.shippingAddress ? JSON.parse(metadata.shippingAddress) : {};
    const splitData = metadata.splitData ? JSON.parse(metadata.splitData) : {};
    const currency = metadata.currency || 'CHF';

    if (!cartItems.length) {
      return NextResponse.json(
        { error: 'No cart items found in payment metadata' },
        { status: 400 }
      );
    }

    // Create the order and related data in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // First, create the shipping address record
      const address = await tx.address.create({
        data: {
          userId,
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          phone: shippingAddress.phone,
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
      });

      // Create formatted shipping address string
      const formattedShippingAddress = `${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

      // Create the order with the address reference
      const order = await tx.order.create({
        data: {
          customerId: userId,
          merchantId: splitData.subOrders[0]?.merchantId || '', // Legacy field
          status: OrderStatus.PENDING,
          totalAmount: splitData.grandTotal,
          shippingAddress: formattedShippingAddress,
          shippingAddressId: address.id,
          grandTotal: splitData.grandTotal,
          currency,
          gatewayUsed: metadata.paymentMethod === 'paypal' ? 'PAYPAL' : 'STRIPE',
          paymentStatus: 'SUCCEEDED',
        },
      });

      // Create sub-orders with their items
      for (const so of splitData.subOrders) {
        // Create the sub-order
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

        // Create order items for this sub-order
        for (const item of so.items) {
          // Get the product to ensure it exists and get its details
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          await tx.orderItem.create({
            data: {
              subOrderId: subOrder.id,
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          });
        }
      }

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          gateway: metadata.paymentMethod === 'paypal' ? 'PAYPAL' : 'STRIPE',
          status: 'SUCCEEDED',
          amount: splitData.grandTotal,
          currency,
          transactionId: paymentIntentId,
          raw: paymentIntent as any,
        },
      });

      // Update merchant balances
      await paymentService.updateMerchantBalances({
        id: order.id,
        subOrders: await tx.subOrder.findMany({
          where: { orderId: order.id },
        }),
      });

      // Fetch the complete order with all related data
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          subOrders: {
            include: {
              items: true,
            },
          },
        },
      });
    });

    // Send order confirmation emails asynchronously (don't block response)
    try {
      // Send confirmation to customer
      sendOrderConfirmationEmail(
        shippingAddress.email,
        `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        {
          orderId: result.id,
          totalAmount: result.grandTotal,
          currency: result.currency,
          items: result.subOrders.flatMap(subOrder =>
            subOrder.items.map(item => ({
              productTitle: item.product.title_en,
              quantity: item.quantity,
              price: item.price
            }))
          )
        }
      ).catch(err => console.error('Failed to send customer confirmation email:', err));

      // Send notifications to merchants
      for (const subOrder of result.subOrders) {
        sendOrderNotificationToMerchant(
          subOrder.merchant.user.email,
          subOrder.merchant.user.name,
          {
            orderId: result.id,
            customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            customerEmail: shippingAddress.email,
            totalAmount: subOrder.subtotal,
            currency: result.currency,
            items: subOrder.items.map(item => ({
              productTitle: item.product.title_en,
              quantity: item.quantity,
              price: item.price
            }))
          }
        ).catch(err => console.error('Failed to send merchant notification:', err));
      }
    } catch (error) {
      // Don't fail the order if emails fail
      console.error('Error sending order emails:', error);
    }

    return NextResponse.json({
      success: true,
      order: result,
      payment: {
        id: paymentIntentId,
        status: 'succeeded',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);

    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
