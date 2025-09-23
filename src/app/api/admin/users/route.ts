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

    // Get all users with their merchant (if any)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: true,
      },
    });

    const shaped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isDeleted: (u as any).isDeleted ?? false,
      createdAt: u.createdAt,
      merchantId: (u as any).merchant?.id || null,
      merchantStatus: (u as any).merchant?.status || null,
      storeName: (u as any).merchant?.storeName || null,
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
