// src/app/api/merchant/status/route.ts
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

    // Get the merchant associated with the current user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, storeName: true }
    });

    // If merchant doesn't exist, return PENDING status
    if (!merchant) {
      return NextResponse.json({
        status: 'PENDING',
        storeName: null
      });
    }

    return NextResponse.json({
      status: merchant.status,
      storeName: merchant.storeName
    });

  } catch (error) {
    console.error('Error in merchant status API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchant status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

