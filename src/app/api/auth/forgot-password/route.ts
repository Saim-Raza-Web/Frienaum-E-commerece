import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/email';

function getAppBaseUrl(request: NextRequest) {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    request.headers.get('origin') ||
    request.nextUrl.origin;

  const fallback = 'https://feinraumshop.ch';
  return (envUrl || fallback).replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const { email, lang } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const locale = typeof lang === 'string' && /^[a-z]{2}$/i.test(lang) ? lang.toLowerCase() : 'de';
    const appBaseUrl = getAppBaseUrl(request);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: resetExpires,
      },
    });

    // Send reset email
    const resetUrl = `${appBaseUrl}/${locale}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    const isDevelopment = process.env.NODE_ENV === 'development';

    // In development, if it's an SMTP connection error, return a more specific message
    if (isDevelopment && error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({
        error: 'SMTP connection failed - check your email configuration',
        details: 'In development mode, emails are logged to console instead of being sent'
      }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
