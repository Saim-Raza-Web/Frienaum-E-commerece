import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/terms - Get current active terms version
export async function GET() {
  try {
    const currentTerms = await prisma.termsVersion.findFirst({
      where: { isActive: true },
      orderBy: { effectiveDate: 'desc' }
    });

    if (!currentTerms) {
      return NextResponse.json(
        { error: 'No active terms found' },
        { status: 404 }
      );
    }

    return NextResponse.json(currentTerms);
  } catch (error) {
    console.error('Error fetching terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms' },
      { status: 500 }
    );
  }
}

// POST /api/terms/accept - Accept terms and conditions
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
    const { termsVersionId, accepted } = body;

    if (!termsVersionId || accepted !== true) {
      return NextResponse.json(
        { error: 'Invalid request: termsVersionId and accepted=true required' },
        { status: 400 }
      );
    }

    // Verify the terms version exists and is active
    const termsVersion = await prisma.termsVersion.findUnique({
      where: { id: termsVersionId }
    });

    if (!termsVersion) {
      return NextResponse.json(
        { error: 'Terms version not found' },
        { status: 404 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Update user's T&C acceptance
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsAcceptedVersion: termsVersion.version,
        termsAcceptedIP: ip
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        termsAccepted: updatedUser.termsAccepted,
        termsAcceptedAt: updatedUser.termsAcceptedAt,
        termsAcceptedVersion: updatedUser.termsAcceptedVersion
      }
    });
  } catch (error) {
    console.error('Error accepting terms:', error);
    return NextResponse.json(
      { error: 'Failed to accept terms' },
      { status: 500 }
    );
  }
}
