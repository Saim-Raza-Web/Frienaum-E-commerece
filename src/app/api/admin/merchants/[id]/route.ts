import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
      }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [productCount, orderCount, paymentsRevenueAgg, deliveredOrdersRevenueAgg, latestProducts, latestOrders] = await Promise.all([
      prisma.product.count({ where: { merchantId: id } }),
      prisma.order.count({ where: { merchantId: id } }),
      // Primary revenue source: successful USD payments linked to this merchant's orders
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED', currency: 'USD', order: { merchantId: id } },
      }),
      // Fallback: sum of delivered orders' grand totals
      prisma.order.aggregate({ _sum: { grandTotal: true }, where: { merchantId: id, status: 'DELIVERED' } }),
      prisma.product.findMany({ where: { merchantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, slug: true, title_en: true, price: true, stock: true, createdAt: true, imageUrl: true } }),
      prisma.order.findMany({ where: { merchantId: id }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, status: true, totalAmount: true, createdAt: true } }),
    ]);

    return NextResponse.json({
      id: merchant.id,
      storeName: merchant.storeName,
      status: merchant.status,
      createdAt: merchant.createdAt,
      user: merchant.user,
      stats: {
        productCount,
        orderCount,
        revenue: (paymentsRevenueAgg._sum.amount || 0) > 0
          ? (paymentsRevenueAgg._sum.amount || 0)
          : (deliveredOrdersRevenueAgg._sum.grandTotal || 0),
      },
      latestProducts,
      latestOrders,
    });
  } catch (error) {
    console.error('Error fetching merchant details:', error);
    return NextResponse.json({ error: 'Failed to fetch merchant' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = getUserFromNextRequest(request);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params; // merchant id

    // Load merchant with linked user
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Soft-delete user and suspend merchant
    await prisma.$transaction([
      prisma.user.update({ where: { id: merchant.userId }, data: { isDeleted: true, role: 'CUSTOMER' } as any }),
      prisma.merchant.update({ where: { id }, data: { status: 'SUSPENDED' } }),
    ]);

    return NextResponse.json({ success: true, softDeletedUser: merchant.userId, merchantStatus: 'SUSPENDED' });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json({ error: 'Failed to soft-delete merchant' }, { status: 500 });
  }
}
