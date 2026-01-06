import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('token')?.value;
    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
      console.log('Token verified for user:', payload.id, 'role:', payload.role);
    } catch (error) {
      console.log('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // Check if user is a merchant
    if (payload.role !== 'MERCHANT') {
      console.log('User is not a merchant, role:', payload.role);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve merchant record from the logged-in user's id
    const merchant = await prisma.merchant.findUnique({
      where: { userId: userId },
      select: { id: true, status: true }
    });

    // If merchant doesn't exist, return empty array instead of error
    if (!merchant) {
      console.log('Merchant profile not found for user:', userId, '- returning empty orders');
      return NextResponse.json([]);
    }

    console.log('Found merchant:', merchant.id, 'status:', merchant.status);

    // Fetch orders for this merchant
    const orders = await prisma.order.findMany({
      where: { merchantId: merchant.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out items with null products
    const filteredOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => item.product !== null)
    })).filter(order => order.items.length > 0);

    console.log('Found orders count:', filteredOrders.length);
    return NextResponse.json(filteredOrders);
  } catch (error) {
    console.error('Error fetching merchant orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
