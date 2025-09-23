import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { splitCart, type CartItemInput } from '@/lib/payments';
import { paymentService } from '@/lib/payment-service';
import { OrderStatus, PaymentGateway, Prisma } from '@prisma/client';

type CheckoutRequest = {
  cart: CartItemInput[];
  shippingAddress: string;
  currency: string;
  paymentMethod: 'stripe' | 'paypal';
  returnUrl: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CheckoutRequest = await req.json().catch(() => ({} as any));
    const { cart, shippingAddress, currency = 'USD', paymentMethod, returnUrl } = body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    if (!paymentMethod || !['stripe', 'paypal'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Build split summary
    const split = await splitCart(cart);

    if (split.subOrders.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
    }

    // Create a transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // First, create the order without subOrders to satisfy the foreign key constraint
      const order = await tx.order.create({
        data: {
          customerId: session.user.id,
          merchantId: split.subOrders[0].merchantId, // Legacy field
          status: OrderStatus.PENDING,
          totalAmount: split.grandTotal,
          shippingAddress,
          grandTotal: split.grandTotal,
          currency,
        },
      });

      // Then create sub-orders with their items
      for (const so of split.subOrders) {
        // First create the sub-order
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

        // Then create order items for this sub-order
        for (const item of so.items) {
          // First, get the product to ensure it exists and get its details
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

      // Fetch the order with all related data
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

    if (!order) {
      throw new Error('Failed to create order');
    }

    // Process payment based on the selected method
    let paymentResult;
    const metadata = {
      orderId: order.id,
      customerId: session.user.id,
    };

    try {
      if (paymentMethod === 'stripe') {
        // Create Stripe payment intent
        const paymentIntent = await paymentService.createPaymentIntent(
          order.grandTotal,
          order.currency,
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
          order.grandTotal,
          order.currency,
          metadata
        );
        
        paymentResult = {
          orderId: paypalOrder.id,
          returnUrl,
        };
      }

      return NextResponse.json({
        orderId: order.id,
        status: 'PENDING_PAYMENT',
        payment: {
          method: paymentMethod,
          ...paymentResult,
        },
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      // Update order status to failed
      await prisma.order.update({
        where: { id: order?.id },
        data: { 
          status: OrderStatus.CANCELLED,
          // Add any additional fields that exist in your schema
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
