import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    const customerId = params.id;

    const orders = await prisma.order.findMany({
      where: { merchantId: merchant.id, customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, title_en: true, price: true } }
          }
        }
      }
    });

    const result = orders.map(o => ({
      id: o.id,
      status: o.status,
      total: o.grandTotal ?? o.totalAmount,
      currency: o.currency,
      createdAt: o.createdAt,
      items: o.items.map(i => ({
        id: i.id,
        productId: i.productId,
        name: i.product?.title_en,
        price: i.price,
        quantity: i.quantity,
      }))
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch customer orders' }, { status: 500 });
  }
}
