import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  console.log('Cookie header:', cookieHeader);
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getUserFromNextRequest(request);
    console.log('GET customer - User:', user);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id }, select: { id: true } });
    console.log('GET customer - Merchant:', merchant);
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    const customerId = resolvedParams.id;
    console.log('GET customer - Customer ID:', customerId);

    // Ensure this customer is linked to this merchant (or backfill via orders)
    const mc = await prisma.merchantCustomer.findUnique({
      where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
      include: { customer: { select: { id: true, email: true, name: true, createdAt: true, customerProfile: { select: { phone: true } } } } }
    });

    // If no MerchantCustomer row, attempt to infer from any orders and create a minimal entry
    if (!mc) {
      const anyOrder = await prisma.order.findFirst({
        where: { merchantId: merchant.id, customerId },
        orderBy: { createdAt: 'desc' },
        select: { customerId: true, createdAt: true, totalAmount: true }
      });

      if (anyOrder) {
        await prisma.merchantCustomer.upsert({
          where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
          create: {
            merchantId: merchant.id,
            customerId,
            totalOrders: 1,
            totalSpent: anyOrder.totalAmount || 0,
            lastOrderAt: anyOrder.createdAt,
            tags: [],
          },
          update: {}
        });
      }
    }

    const result = await prisma.merchantCustomer.findUnique({
      where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
      include: {
        customer: { select: { id: true, email: true, name: true, createdAt: true, customerProfile: { select: { phone: true } } } }
      }
    });

    const addresses = await prisma.address.findMany({ where: { userId: customerId } });
    const profile = await prisma.customerProfile.findUnique({ where: { userId: customerId }, include: { defaultAddress: true } });

    if (!result) return NextResponse.json({ error: 'Customer not found for this merchant' }, { status: 404 });

    return NextResponse.json({
      id: result.customer.id,
      email: result.customer.email,
      name: result.customer.name,
      createdAt: result.customer.createdAt,
      totalOrders: result.totalOrders,
      totalSpent: result.totalSpent,
      lastOrderAt: result.lastOrderAt,
      tags: result.tags || [],
      notes: result.notes || '',
      addresses,
      profile,
    });
  } catch (error) {
    console.error('Error fetching customer detail:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getUserFromNextRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    const customerId = resolvedParams.id;
    const body = await request.json().catch(() => ({}));
    const { tags, notes } = body as { tags?: string[]; notes?: string };

    const updated = await prisma.merchantCustomer.update({
      where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
      data: {
        ...(Array.isArray(tags) ? { tags } : {}),
        ...(typeof notes === 'string' ? { notes } : {}),
      },
      include: { customer: { select: { id: true, email: true, name: true } } }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating customer notes/tags:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const user = getUserFromNextRequest(request);
    console.log('DELETE customer - User:', user);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const merchant = await prisma.merchant.findUnique({ where: { userId: user.id }, select: { id: true } });
    console.log('DELETE customer - Merchant:', merchant);
    if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });

    const customerId = resolvedParams.id;
    console.log('DELETE customer - Customer ID:', customerId);
    console.log('DELETE customer - Merchant ID:', merchant.id);

    // Check if record exists before deletion
    const existingRecord = await prisma.merchantCustomer.findUnique({
      where: { merchantId_customerId: { merchantId: merchant.id, customerId } }
    });
    console.log('DELETE customer - Existing record before deletion:', existingRecord);

    if (!existingRecord) {
      console.log('DELETE customer - Record not found, returning 404');
      return NextResponse.json({ error: 'Customer not found for this merchant' }, { status: 404 });
    }

    console.log('DELETE customer - Attempting to delete record...');
    try {
      const deleteResult = await prisma.merchantCustomer.delete({
        where: { merchantId_customerId: { merchantId: merchant.id, customerId } },
      });
      console.log('DELETE customer - Delete result:', deleteResult);
    } catch (deleteError) {
      console.error('DELETE customer - Database deletion failed:', deleteError);
      return NextResponse.json({
        error: 'Database deletion failed',
        details: deleteError instanceof Error ? deleteError.message : 'Unknown database error'
      }, { status: 500 });
    }

    // Verify deletion by checking again
    const verifyDeletion = await prisma.merchantCustomer.findUnique({
      where: { merchantId_customerId: { merchantId: merchant.id, customerId } }
    });
    console.log('DELETE customer - Record after deletion attempt:', verifyDeletion);

    if (verifyDeletion) {
      console.error('DELETE customer - FAILED: Record still exists after deletion attempt!');
      return NextResponse.json({ error: 'Failed to delete customer from database' }, { status: 500 });
    }

    console.log('DELETE customer - Successfully deleted');
    return NextResponse.json({ ok: true, message: 'Customer successfully removed' });
  } catch (error) {
    console.error('Error removing merchant customer link:', error);
    return NextResponse.json({ error: 'Failed to remove customer link', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
