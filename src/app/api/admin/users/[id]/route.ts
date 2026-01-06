import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getUserFromNextRequest(request);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        merchant: true,
        customerProfile: true,
        ordersAsCustomer: {
          select: { id: true }
        }
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If user has a merchant profile, cascade delete their business data.
    if (user.merchant) {
      const merchantId = user.merchant.id;

      // Find all orders for this merchant
      const orders = await prisma.order.findMany({
        where: { merchantId },
        select: { id: true },
      });
      const orderIds = orders.map(o => o.id);

      // Delete order items for those orders
      if (orderIds.length > 0) {
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      }

      // Delete orders for this merchant
      await prisma.order.deleteMany({ where: { merchantId } });

      // Delete products for this merchant
      await prisma.product.deleteMany({ where: { merchantId } });

      // Delete merchant profile
      await prisma.merchant.delete({ where: { id: merchantId } });
    }

    // Delete customer-related data
    // Delete orders placed by this user as a customer
    if (user.ordersAsCustomer && user.ordersAsCustomer.length > 0) {
      const customerOrderIds = user.ordersAsCustomer.map(o => o.id);
      
      // Delete order items for customer orders
      await prisma.orderItem.deleteMany({ 
        where: { orderId: { in: customerOrderIds } } 
      });
      
      // Delete payments for customer orders
      await prisma.payment.deleteMany({ 
        where: { orderId: { in: customerOrderIds } } 
      });
      
      // Delete customer orders
      await prisma.order.deleteMany({ 
        where: { customerId: userId } 
      });
    }

    // Delete MerchantCustomer records (where this user is a customer)
    await prisma.merchantCustomer.deleteMany({ 
      where: { customerId: userId } 
    });

    // Delete ratings by this user (Rating model uses customerId, not userId)
    await prisma.rating.deleteMany({ 
      where: { customerId: userId } 
    });

    // Delete addresses
    await prisma.address.deleteMany({ 
      where: { userId: userId } 
    });

    // Delete password reset tokens
    await prisma.passwordResetToken.deleteMany({ 
      where: { userId: userId } 
    });

    // Delete customer profile (if exists)
    if (user.customerProfile) {
      await prisma.customerProfile.delete({ 
        where: { userId: userId } 
      });
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
