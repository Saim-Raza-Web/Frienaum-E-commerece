import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromNextRequest(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If user has a merchant profile, cascade delete their business data.
    if (user.merchant) {
      const merchantId = user.merchant.id;

      // Find all orders for this merchant
      const orders = await prisma.order.findMany({
        where: { merchantId },
        select: { id: true },
      });
      const orderIds = orders.map(o => o.id);

      // Delete order items for those orders
      if (orderIds.length > 0) {
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      }

      // Delete orders for this merchant
      await prisma.order.deleteMany({ where: { merchantId } });

      // Delete products for this merchant
      await prisma.product.deleteMany({ where: { merchantId } });

      // Delete merchant profile
      await prisma.merchant.delete({ where: { id: merchantId } });
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
