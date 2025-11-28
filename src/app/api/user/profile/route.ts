import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;
    const body = await req.json();
    const { firstName, lastName, phone } = body;

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`.trim();

    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true, role: true }
    });

    // Update or create customer profile for phone
    if (phone !== undefined) {
      await prisma.customerProfile.upsert({
        where: { userId },
        update: { phone: phone || null },
        create: {
          userId,
          phone: phone || null
        }
      });
    }

    // Get customer profile to return phone
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId },
      select: { phone: true }
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      phone: customerProfile?.phone || null
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.id;

    // Get user with customer profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        customerProfile: {
          select: {
            phone: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Split name into firstName and lastName
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      name: user.name,
      role: user.role,
      phone: user.customerProfile?.phone || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

