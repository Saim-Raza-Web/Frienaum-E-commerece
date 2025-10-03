import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // Fetch orders for the authenticated user
    const orders = await prisma.order.findMany({
      where: {
        customerId: userId,
      },
      include: {
        subOrders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    title_en: true,
                    title_de: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Collect all orderItemIds in this page for a single query
    const allOrderItemIds = orders.flatMap(o =>
      o.subOrders.flatMap(so => so.items.map(i => i.id))
    );

    const existingRatings = await prisma.rating.findMany({
      where: {
        customerId: userId,
        orderItemId: { in: allOrderItemIds },
      },
      select: { orderItemId: true },
    });

    const ratedSet = new Set(existingRatings.map(r => r.orderItemId));

    const augmented = orders.map(o => ({
      ...o,
      subOrders: o.subOrders.map(so => ({
        ...so,
        items: so.items.map(i => ({
          ...i,
          hasRated: ratedSet.has(i.id),
        })),
      })),
    }));

    return NextResponse.json(augmented);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
