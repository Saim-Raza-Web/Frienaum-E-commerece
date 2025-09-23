import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json();

    // Validate status
    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Resolve merchant record from the logged-in user's id
    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
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
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
