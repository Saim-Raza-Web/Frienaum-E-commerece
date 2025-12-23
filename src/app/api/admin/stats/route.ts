import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getUserFromNextRequest(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parallelize counts for performance
    // Important: Some existing user docs may not have `isDeleted` set yet (Mongo missing field).
    // Counting with `where: { isDeleted: false }` would miss those documents.
    // So we compute active users as (all users) - (users with isDeleted = true).
    const [allUsers, deletedUsers, totalOrders, paymentsRevenueAgg, deliveredOrdersRevenueAgg, activeProducts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isDeleted: true } as any }),
      prisma.order.count(),
      // Primary source of truth: sum of successful CHF payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCEEDED', currency: 'CHF' },
      }),
      // Fallback: sum of delivered orders' grandTotal (assumed CHF by default schema)
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { status: 'DELIVERED' },
      }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
    ]);

    const totalUsers = allUsers - deletedUsers;
    const paymentsRevenue = paymentsRevenueAgg._sum.amount || 0;
    const deliveredOrdersRevenue = deliveredOrdersRevenueAgg._sum.grandTotal || 0;
    const revenue = paymentsRevenue > 0 ? paymentsRevenue : deliveredOrdersRevenue;

    return NextResponse.json({
      totalUsers,
      totalOrders,
      revenue,
      activeProducts,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
