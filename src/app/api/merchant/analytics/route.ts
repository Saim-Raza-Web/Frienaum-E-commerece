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

    const merchantId = merchant.id;

    // Get date ranges for analytics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Revenue Analytics
    const [
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      weeklyRevenue,
      dailyRevenue,
      revenueByStatus
    ] = await Promise.all([
      // Total revenue
      prisma.payment.aggregate({
        where: {
          order: { merchantId },
          status: PaymentStatus.SUCCEEDED
        },
        _sum: { amount: true }
      }),
      // This month revenue
      prisma.payment.aggregate({
        where: {
          order: { merchantId },
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      // Last month revenue
      prisma.payment.aggregate({
        where: {
          order: { merchantId },
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { amount: true }
      }),
      // This week revenue
      prisma.payment.aggregate({
        where: {
          order: { merchantId },
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: startOfWeek }
        },
        _sum: { amount: true }
      }),
      // Today revenue
      prisma.payment.aggregate({
        where: {
          order: { merchantId },
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: startOfDay }
        },
        _sum: { amount: true }
      }),
      // Revenue by order status
      prisma.order.groupBy({
        by: ['status'],
        where: { merchantId },
        _sum: { totalAmount: true },
        _count: { id: true }
      })
    ]);

    // 2. Order Analytics
    const [
      totalOrders,
      monthlyOrders,
      lastMonthOrders,
      weeklyOrders,
      dailyOrders,
      ordersByStatus
    ] = await Promise.all([
      prisma.order.count({ where: { merchantId } }),
      prisma.order.count({ 
        where: { merchantId, createdAt: { gte: startOfMonth } }
      }),
      prisma.order.count({ 
        where: { 
          merchantId, 
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      }),
      prisma.order.count({ 
        where: { merchantId, createdAt: { gte: startOfWeek } }
      }),
      prisma.order.count({ 
        where: { merchantId, createdAt: { gte: startOfDay } }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { merchantId },
        _count: { id: true }
      })
    ]);

    // 3. Customer Analytics
    const [
      totalCustomers,
      newCustomersThisMonth,
      newCustomersLastMonth,
      activeCustomers,
      topCustomers
    ] = await Promise.all([
      prisma.merchantCustomer.count({ where: { merchantId } }),
      prisma.merchantCustomer.count({
        where: {
          merchantId,
          createdAt: { gte: startOfMonth }
        }
      }),
      prisma.merchantCustomer.count({
        where: {
          merchantId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        }
      }),
      prisma.merchantCustomer.count({
        where: {
          merchantId,
          lastOrderAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      }),
      prisma.merchantCustomer.findMany({
        where: { merchantId },
        include: {
          customer: { select: { name: true, email: true } }
        },
        orderBy: { totalSpent: 'desc' },
        take: 5
      })
    ]);

    // 4. Product Analytics
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      topProducts,
      productPerformance
    ] = await Promise.all([
      prisma.product.count({ where: { merchantId } }),
      prisma.product.count({ 
        where: { merchantId, stock: { lte: 10, gt: 0 } }
      }),
      prisma.product.count({ 
        where: { merchantId, stock: 0 }
      }),
      prisma.product.findMany({
        where: { merchantId },
        include: {
          orderItems: {
            include: { order: true },
            where: { order: { status: OrderStatus.DELIVERED } }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.product.findMany({
        where: { merchantId },
        include: {
          orderItems: {
            include: { order: true },
            where: { order: { status: OrderStatus.DELIVERED } }
          }
        },
        orderBy: { averageRating: 'desc' },
        take: 5
      })
    ]);

    // 5. Sales Trends (Last 12 months)
    const salesTrends = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        merchantId,
        status: OrderStatus.DELIVERED,
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    // Calculate growth rates
    const monthlyGrowth = lastMonthRevenue._sum.amount 
      ? ((monthlyRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1) * 100
      : 0;

    const orderGrowth = lastMonthOrders 
      ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;

    const customerGrowth = newCustomersLastMonth
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : 0;

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: monthlyRevenue._sum.amount || 0,
        lastMonth: lastMonthRevenue._sum.amount || 0,
        weekly: weeklyRevenue._sum.amount || 0,
        daily: dailyRevenue._sum.amount || 0,
        byStatus: revenueByStatus,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100
      },
      orders: {
        total: totalOrders,
        monthly: monthlyOrders,
        lastMonth: lastMonthOrders,
        weekly: weeklyOrders,
        daily: dailyOrders,
        byStatus: ordersByStatus,
        growth: Math.round(orderGrowth * 100) / 100
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        newLastMonth: newCustomersLastMonth,
        active: activeCustomers,
        topCustomers: topCustomers.map(c => ({
          id: c.customer.id,
          name: c.customer.name,
          email: c.customer.email,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
          lastOrderAt: c.lastOrderAt
        })),
        growth: Math.round(customerGrowth * 100) / 100
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        topProducts: topProducts.map(p => ({
          id: p.id,
          title: p.title_en,
          price: p.price,
          stock: p.stock,
          totalSold: p.orderItems.reduce((sum, item) => sum + item.quantity, 0),
          revenue: p.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        })),
        bestRated: productPerformance.map(p => ({
          id: p.id,
          title: p.title_en,
          rating: p.averageRating,
          ratingCount: p.ratingCount
        }))
      },
      salesTrends: salesTrends.map(trend => ({
        date: trend.createdAt,
        revenue: trend._sum.totalAmount || 0,
        orders: trend._count.id
      }))
    });

  } catch (error) {
    console.error('Error in merchant analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
