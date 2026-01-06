import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromNextRequest(request);
    console.log('Customers list - User:', user);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id }, select: { id: true } });
    console.log('Customers list - Merchant:', merchant);
    // If merchant doesn't exist, return empty array instead of error
    if (!merchant) {
      console.log('Merchant not found, returning empty customers array');
      return NextResponse.json([]);
    }

    // 1) Pull recent orders to compute stats and backfill MerchantCustomer
    const orders = await prisma.order.findMany({
      where: { merchantId: merchant.id },
      select: { customerId: true, createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Customers list - Orders count:', orders.length);

    const statsByCustomer = new Map<string, { totalOrders: number; totalSpent: number; lastOrderAt: Date }>();
    for (const o of orders) {
      if (!o.customerId) continue;
      const s = statsByCustomer.get(o.customerId) || { totalOrders: 0, totalSpent: 0, lastOrderAt: o.createdAt };
      s.totalOrders += 1;
      s.totalSpent += o.totalAmount || 0;
      if (o.createdAt > s.lastOrderAt) s.lastOrderAt = o.createdAt;
      statsByCustomer.set(o.customerId, s);
    }

    // 2) Only create MerchantCustomer records for customers who DON'T have one AND have recent orders
    // Don't recreate records that were explicitly deleted
    for (const [customerId, s] of statsByCustomer.entries()) {
      const existingRecord = await prisma.merchantCustomer.findUnique({
        where: { merchantId_customerId: { merchantId: merchant.id, customerId } }
      });
      console.log(`Backfill check for customer ${customerId}:`, {
        existingRecord: existingRecord ? 'EXISTS' : 'NOT FOUND',
        customerStats: s,
        shouldCreate: !existingRecord && s.totalOrders > 0
      });

      // Only create if no record exists AND customer has orders
      if (!existingRecord && s.totalOrders > 0) {
        console.log(`Creating new MerchantCustomer record for customer ${customerId} with ${s.totalOrders} orders`);
        await prisma.merchantCustomer.create({
          data: {
            merchantId: merchant.id,
            customerId,
            totalOrders: s.totalOrders,
            totalSpent: s.totalSpent,
            lastOrderAt: s.lastOrderAt,
            tags: [],
          }
        });
      } else if (existingRecord) {
        console.log(`Updating existing MerchantCustomer record for customer ${customerId}`);
        // Update existing record with latest stats
        await prisma.merchantCustomer.update({
          where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
          data: {
            totalOrders: s.totalOrders,
            totalSpent: s.totalSpent,
            lastOrderAt: s.lastOrderAt,
          }
        });
      }
    }

    // 3) Return customers from MerchantCustomer joined with User
    const mc = await prisma.merchantCustomer.findMany({
      where: { merchantId: merchant.id },
      include: {
        customer: { select: { id: true, email: true, name: true, createdAt: true, customerProfile: { select: { phone: true } } } },
      },
      orderBy: { lastOrderAt: 'desc' }
    });
    console.log('Customers list - MerchantCustomer records found:', mc.length);

    const result = mc.map((row: typeof mc[number]) => {
      const fullName = row.customer.name || '';
      const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
      const lastName = rest.join(' ');
      const status = row.totalOrders > 0 || row.lastOrderAt ? 'active' : 'inactive';
      return {
        id: row.customer.id,
        email: row.customer.email,
        name: row.customer.name,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: row.customer.customerProfile?.phone || null,
        totalOrders: row.totalOrders,
        totalSpent: Number((row.totalSpent || 0).toFixed(2)),
        lastOrderDate: row.lastOrderAt ? row.lastOrderAt.toISOString() : null,
        status,
        tags: row.tags || [],
        notes: row.notes || '',
        firstOrderDate: row.customer.createdAt?.toISOString?.() || null,
      };
    });

    console.log('Customers list - Final result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in merchant customers API:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
