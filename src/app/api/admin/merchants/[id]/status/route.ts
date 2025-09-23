import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

const ALLOWED_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED'] as const;

type AllowedStatus = typeof ALLOWED_STATUSES[number];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status: AllowedStatus | undefined = body?.status;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
    }

    const updated = await prisma.merchant.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, storeName: true, userId: true },
    }).catch(() => null);

    if (!updated) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating merchant status:', error);
    return NextResponse.json({ error: 'Failed to update merchant status' }, { status: 500 });
  }
}
