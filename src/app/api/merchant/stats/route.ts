// src/app/api/merchant/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the merchant associated with the current user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Get total sales (sum of all successful payments for this merchant)
    const salesResult = await prisma.payment.aggregate({
      where: {
        order: {
          merchantId: merchant.id,
          status: OrderStatus.DELIVERED
        },
        status: PaymentStatus.SUCCEEDED
      },
      _sum: {
        amount: true
      }
    });

    // Get total number of orders (all orders, not just delivered)
    const orderCount = await prisma.order.count({
      where: {
        merchantId: merchant.id
      }
    });

    // Get number of unique customers from MerchantCustomer table (same as customer management)
    const uniqueCustomers = await prisma.merchantCustomer.count({
      where: {
        merchantId: merchant.id
      }
    });

    // Get total number of products for this merchant
    const productCount = await prisma.product.count({
      where: {
        merchantId: merchant.id
      }
    });

    return NextResponse.json({
      totalSales: salesResult._sum.amount || 0,
      totalOrders: orderCount,
      totalCustomers: uniqueCustomers,
      totalProducts: productCount
    });

  } catch (error) {
    console.error('Error in merchant stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchant statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}