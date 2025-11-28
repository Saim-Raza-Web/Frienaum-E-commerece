import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { sendMerchantWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const storeName: string | undefined = body?.storeName;
    if (!storeName || typeof storeName !== 'string' || storeName.trim().length < 2) {
      return NextResponse.json({ error: 'Valid storeName is required' }, { status: 400 });
    }

    // If merchant already exists for this user, return it
    const existing = await prisma.merchant.findUnique({ where: { userId: session.user.id } }).catch(() => null);
    if (existing) {
      return NextResponse.json(existing);
    }

    // Create merchant profile and update user role to MERCHANT
    const created = await prisma.merchant.create({
      data: {
        userId: session.user.id,
        storeName: storeName.trim(),
        status: 'PENDING',
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'MERCHANT' },
    }).catch(() => {});

    // Send welcome email (don't block response if email fails)
    try {
      sendMerchantWelcomeEmail(
        session.user.email!,
        session.user.name || 'Merchant',
        storeName.trim()
      ).catch(err => console.error('Failed to send merchant welcome email:', err));
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error registering merchant:', error);
    return NextResponse.json({ error: 'Failed to register merchant' }, { status: 500 });
  }
}
