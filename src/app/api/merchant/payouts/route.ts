import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromReq } from '@/lib/apiAuth';

function getUserFromNextRequest(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || '';
  return getUserFromReq({ headers: { cookie: cookieHeader } } as any);
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromReq({ headers: { cookie: request.headers.get('cookie') || '' } } as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the merchant associated with the current user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Get payout balance
    const payoutBalance = await prisma.payoutBalance.findUnique({
      where: { merchantId: merchant.id }
    });

    // Get recent payout transactions (last 50)
    const transactions = await prisma.payoutTransaction.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Calculate total earnings from successful payments
    const totalEarnings = await prisma.payment.aggregate({
      where: {
        order: {
          merchantId: merchant.id,
          status: 'DELIVERED'
        },
        status: 'SUCCEEDED'
      },
      _sum: { amount: true }
    });

    // Calculate pending payouts (orders that are paid but not yet delivered)
    const pendingEarnings = await prisma.payment.aggregate({
      where: {
        order: {
          merchantId: merchant.id,
          status: { in: ['PENDING', 'PROCESSING', 'SHIPPED'] }
        },
        status: 'SUCCEEDED'
      },
      _sum: { amount: true }
    });

    const response = {
      balance: {
        available: payoutBalance?.available || 0,
        pending: payoutBalance?.pending || 0,
        total: (payoutBalance?.available || 0) + (payoutBalance?.pending || 0)
      },
      summary: {
        totalEarnings: totalEarnings._sum.amount || 0,
        pendingEarnings: pendingEarnings._sum.amount || 0,
        totalPaidOut: transactions
          .filter(t => t.status === 'PAID')
          .reduce((sum, t) => sum + t.amount, 0)
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        method: t.method,
        externalRef: t.externalRef,
        createdAt: t.createdAt
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching merchant payouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromReq({ headers: { cookie: request.headers.get('cookie') || '' } } as any);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'MERCHANT' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Get the merchant associated with the current user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Check available balance
    const payoutBalance = await prisma.payoutBalance.findUnique({
      where: { merchantId: merchant.id }
    });

    if (!payoutBalance || payoutBalance.available < amount) {
      return NextResponse.json({
        error: 'Insufficient balance',
        available: payoutBalance?.available || 0
      }, { status: 400 });
    }

    // Create payout transaction request
    const payoutTransaction = await prisma.payoutTransaction.create({
      data: {
        merchantId: merchant.id,
        amount,
        status: 'PENDING',
        method: 'BANK_TRANSFER', // Default method, could be configurable later
      }
    });

    // Update balance (move from available to pending)
    await prisma.payoutBalance.update({
      where: { merchantId: merchant.id },
      data: {
        available: { decrement: amount },
        pending: { increment: amount }
      }
    });

    return NextResponse.json({
      message: 'Payout request submitted successfully',
      transaction: {
        id: payoutTransaction.id,
        amount: payoutTransaction.amount,
        status: payoutTransaction.status,
        method: payoutTransaction.method,
        createdAt: payoutTransaction.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error requesting payout:', error);
    return NextResponse.json(
      { error: 'Failed to request payout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}