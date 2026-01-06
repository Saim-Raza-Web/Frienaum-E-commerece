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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve merchant by current user (ADMIN can pass merchantId via query if needed)
    const { searchParams } = new URL(request.url);
    const queryMerchantId = searchParams.get('merchantId');

    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    const effectiveMerchantId = user.role === 'ADMIN' && queryMerchantId ? queryMerchantId : merchant?.id;

    // If merchant doesn't exist, return empty array instead of error
    if (!effectiveMerchantId) {
      return NextResponse.json([]);
    }

    // Return only this merchant's products
    const products = await prisma.product.findMany({
      where: { merchantId: effectiveMerchantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching merchant products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
