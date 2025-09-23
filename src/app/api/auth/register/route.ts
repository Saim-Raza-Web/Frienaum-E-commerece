import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, role, storeName } = body || {};

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`.trim();

    // Create user with requested role (default to CUSTOMER)
    const isMerchant = role === 'merchant' || role === 'MERCHANT';
    const createdUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role: isMerchant ? 'MERCHANT' : 'CUSTOMER',
      },
    });

    // If merchant, create Merchant profile
    if (isMerchant) {
      const finalStoreName = (storeName && typeof storeName === 'string' && storeName.trim()) || `${name}'s Store`;
      await prisma.merchant.create({
        data: {
          userId: createdUser.id,
          storeName: finalStoreName,
          status: 'PENDING',
        },
      });
    }

    // Create token for authentication
    const token = signToken({
      id: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    // Create response with user data and set auth cookie
    const response = NextResponse.json({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    }, { status: 201 });

    // Attach authentication cookie
    response.headers.append("Set-Cookie", setAuthCookie(token));

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 });
  }
}
