import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) {
      console.log('GET /api/notifications - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('GET /api/notifications params:', {
      userId: user.id,
      unreadOnly,
      limit
    });

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    console.log('GET /api/notifications fetched:', notifications.map(n => ({
      id: n.id,
      isRead: n.isRead,
      title: n.title
    })));

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) {
      console.log('PATCH /api/notifications - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    console.log('PATCH /api/notifications payload:', {
      userId: user.id,
      notificationIds,
      markAllRead
    });

    if (markAllRead) {
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: { isRead: true }
      });
      console.log('PATCH /api/notifications markAll result:', result);
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length) {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id
        },
        data: { isRead: true }
      });
      console.log('PATCH /api/notifications selective result:', {
        matched: result.count,
        notificationIds
      });
    } else {
      console.log('PATCH /api/notifications - invalid payload');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, unreadCount });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
