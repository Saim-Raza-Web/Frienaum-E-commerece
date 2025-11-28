import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve merchant record from the logged-in user's id
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    // Handle Next.js 15 where context.params may be a Promise
    const rawParams = context?.params;
    const resolvedParams = typeof rawParams?.then === 'function' ? await rawParams : rawParams;
    const orderId: string | undefined = resolvedParams?.id;

    // Check if order exists and belongs to this merchant
    const order = await prisma.order.findFirst({
      where: {
        id: orderId!,
        merchantId: merchant.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete related records first (order items, payments, sub-orders)
    await prisma.orderItem.deleteMany({
      where: { orderId: orderId! },
    });

    await prisma.payment.deleteMany({
      where: { orderId: orderId! },
    });

    await prisma.subOrder.deleteMany({
      where: { orderId: orderId! },
    });

    // Delete the order
    await prisma.order.delete({
      where: {
        id: orderId!,
      },
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json();

    // Validate status
    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Resolve merchant record from the logged-in user's id
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    // Handle Next.js 15 where context.params may be a Promise
    const rawParams = context?.params;
    const resolvedParams = typeof rawParams?.then === 'function' ? await rawParams : rawParams;
    const orderId: string | undefined = resolvedParams?.id;

    const order = await prisma.order.update({
      where: {
        id: orderId!,
          merchantId: merchant.id,
      },
      data: {
        status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: { name: true, email: true }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Send status update email to customer (don't block response)
    try {
      sendOrderStatusUpdateEmail(
        order.customer.email,
        order.customer.name,
        {
          orderId: order.id,
          status,
          totalAmount: order.totalAmount,
          currency: order.currency
        }
      ).catch(err => console.error('Failed to send status update email:', err));
    } catch (error) {
      console.error('Error sending status update email:', error);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
