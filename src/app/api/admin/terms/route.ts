import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/admin/terms - Get all terms versions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const termsVersions = await prisma.termsVersion.findMany({
      orderBy: { effectiveDate: 'desc' }
    });

    return NextResponse.json(termsVersions);
  } catch (error) {
    console.error('Error fetching terms versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch terms versions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/terms - Create new terms version
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { version, title, content, isActive, effectiveDate } = body;

    if (!version || !title || !content) {
      return NextResponse.json(
        { error: 'Version, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if version already exists
    const existingVersion = await prisma.termsVersion.findUnique({
      where: { version }
    });

    if (existingVersion) {
      return NextResponse.json(
        { error: 'Terms version already exists' },
        { status: 409 }
      );
    }

    // If setting as active, deactivate all other versions
    if (isActive) {
      await prisma.termsVersion.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const newTermsVersion = await prisma.termsVersion.create({
      data: {
        version,
        title,
        content,
        isActive: isActive || false,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date()
      }
    });

    return NextResponse.json(newTermsVersion, { status: 201 });
  } catch (error) {
    console.error('Error creating terms version:', error);
    return NextResponse.json(
      { error: 'Failed to create terms version' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/terms/[id]/activate - Activate a specific terms version
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Terms version ID is required' },
        { status: 400 }
      );
    }

    // If activating, deactivate all other versions
    if (isActive) {
      await prisma.termsVersion.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const updatedVersion = await prisma.termsVersion.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(updatedVersion);
  } catch (error) {
    console.error('Error updating terms version:', error);
    return NextResponse.json(
      { error: 'Failed to update terms version' },
      { status: 500 }
    );
  }
}
