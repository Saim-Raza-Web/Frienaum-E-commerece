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
    const [allUsers, deletedUsers, totalOrders, deliveredRevenueAgg, activeProducts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isDeleted: true } as any }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'DELIVERED' },
      }),
      prisma.product.count({ where: { merchant: { status: 'ACTIVE' } } }),
    ]);

    const totalUsers = allUsers - deletedUsers;
    const revenue = deliveredRevenueAgg._sum.totalAmount || 0;

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
