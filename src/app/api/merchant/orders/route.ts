import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'MERCHANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve merchant record from the logged-in user's id
    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    // Fetch orders for this merchant
    const orders = await prisma.order.findMany({
      where: { merchantId: merchant.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching merchant orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
