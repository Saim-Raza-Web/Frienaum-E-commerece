import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromNextRequest(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    // Ensure order exists
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete related records then the order itself
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { orderId: id } }),
      prisma.orderItem.deleteMany({ where: { orderId: id } }),
      prisma.subOrder.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete order' }, { status: 500 });
  }
}


