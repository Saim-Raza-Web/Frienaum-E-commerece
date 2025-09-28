import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentService } from '@/lib/payment-service';
import { verifyToken } from '@/lib/auth';

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

    if (!paymentIntentId || !orderId) {
      return NextResponse.json(
        { error: 'Payment intent ID and order ID are required' },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId,
      },
      include: {
        subOrders: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not in a payable state' },
        { status: 400 }
      );
    }

    // Handle successful payment
    const result = await paymentService.handleSuccessfulPayment(
      paymentIntentId,
      orderId,
      order.grandTotal,
      order.currency
    );

    return NextResponse.json({
      success: true,
      order: result.order,
      payment: result.payment,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);

    // If there's an orderId in the request, try to cancel it
    try {
      const body = await req.json().catch(() => ({} as any));
      if (body.orderId) {
        await prisma.order.update({
          where: { id: body.orderId },
          data: { status: 'CANCELLED' },
        });
      }
    } catch (cancelError) {
      console.error('Failed to cancel order:', cancelError);
    }

    return NextResponse.json(
      { error: 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
