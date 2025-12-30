import { NextRequest, NextResponse } from 'next/server';
import type { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

const merchantHiddenNotificationTypes: NotificationType[] = ['PRODUCT_SUBMITTED'];

function getRoleBasedNotificationFilter(role?: string) {
  if (role === 'MERCHANT') {
    return { type: { notIn: merchantHiddenNotificationTypes } };
  }
  return {};
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

    const baseWhere = {
      userId: user.id,
      ...getRoleBasedNotificationFilter(user.role),
      ...(unreadOnly ? { isRead: false } : {})
    };

    const notifications = await prisma.notification.findMany({
      where: baseWhere,
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
        ...baseWhere,
        isRead: true ? false : false
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

    const roleFilter = getRoleBasedNotificationFilter(user.role);

    if (markAllRead) {
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          ...roleFilter,
          isRead: false
        },
        data: { isRead: true }
      });
      console.log('PATCH /api/notifications markAll result:', result);
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length) {
      const result = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
          ...roleFilter
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

// DELETE /api/notifications - Delete notifications for the current user
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromNextRequest(request);
    if (!user) {
      console.log('DELETE /api/notifications - Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationIds, deleteAll } = body;

    console.log('DELETE /api/notifications payload:', {
      userId: user.id,
      notificationIds,
      deleteAll
    });

    const roleFilter = getRoleBasedNotificationFilter(user.role);

    if (deleteAll) {
      const result = await prisma.notification.deleteMany({
        where: { userId: user.id, ...roleFilter }
      });
      console.log('DELETE /api/notifications deleteAll result:', result.count);
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length) {
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
          ...roleFilter
        }
      });
      console.log('DELETE /api/notifications selective result:', {
        deleted: result.count,
        notificationIds
      });
    } else {
      console.log('DELETE /api/notifications - invalid payload');
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
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
