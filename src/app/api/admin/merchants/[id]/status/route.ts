import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';
import { createNotification } from '@/lib/notifications';

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

    // Send notification to merchant about status change
    if (updated.userId) {
      let notificationType: 'MERCHANT_ACTIVATED' | 'MERCHANT_SUSPENDED' | 'MERCHANT_REGISTERED' = 'MERCHANT_REGISTERED';
      let title = '';
      let message = '';
      
      if (status === 'ACTIVE') {
        notificationType = 'MERCHANT_ACTIVATED';
        title = 'Händlerkonto aktiviert';
        message = `Ihr Händlerkonto "${updated.storeName}" wurde aktiviert. Sie können jetzt Produkte verkaufen.`;
      } else if (status === 'SUSPENDED') {
        notificationType = 'MERCHANT_SUSPENDED';
        title = 'Händlerkonto gesperrt';
        message = `Ihr Händlerkonto "${updated.storeName}" wurde gesperrt. Bitte kontaktieren Sie den Support für weitere Informationen.`;
      } else if (status === 'PENDING') {
        title = 'Händlerkonto ausstehend';
        message = `Ihr Händlerkonto "${updated.storeName}" ist auf ausstehend gesetzt. Bitte warten Sie auf die Überprüfung.`;
      }

      if (title && message) {
        createNotification(
          updated.userId,
          notificationType,
          title,
          message,
          { merchantId: updated.id, storeName: updated.storeName }
        ).catch(err => {
          console.error('Failed to send merchant status notification:', err);
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating merchant status:', error);
    return NextResponse.json({ error: 'Failed to update merchant status' }, { status: 500 });
  }
}
