import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/consents - Get user's current consent status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        newsletterConsent: true,
        newsletterConsentAt: true,
        cookiesConsent: true,
        cookiesConsentAt: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        termsAcceptedVersion: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching consents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consents' },
      { status: 500 }
    );
  }
}

// POST /api/consents - Update user consents
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newsletterConsent, cookiesConsent } = body;

    // Validate input
    if (typeof newsletterConsent !== 'boolean' && typeof cookiesConsent !== 'boolean') {
      return NextResponse.json(
        { error: 'At least one consent type must be provided' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    const updateData: any = {};

    if (typeof newsletterConsent === 'boolean') {
      updateData.newsletterConsent = newsletterConsent;
      if (newsletterConsent) {
        updateData.newsletterConsentAt = new Date();
        updateData.newsletterConsentIP = ip;
      } else {
        updateData.newsletterConsentAt = null;
        updateData.newsletterConsentIP = null;
      }
    }

    if (typeof cookiesConsent === 'boolean') {
      updateData.cookiesConsent = cookiesConsent;
      if (cookiesConsent) {
        updateData.cookiesConsentAt = new Date();
        updateData.cookiesConsentIP = ip;
      } else {
        updateData.cookiesConsentAt = null;
        updateData.cookiesConsentIP = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        newsletterConsent: true,
        newsletterConsentAt: true,
        cookiesConsent: true,
        cookiesConsentAt: true
      }
    });

    return NextResponse.json({
      success: true,
      consents: updatedUser
    });
  } catch (error) {
    console.error('Error updating consents:', error);
    return NextResponse.json(
      { error: 'Failed to update consents' },
      { status: 500 }
    );
  }
}
