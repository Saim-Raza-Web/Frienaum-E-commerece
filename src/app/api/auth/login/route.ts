import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";
import { sendLoginNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Check user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
    });

    // Attach cookie
    response.headers.append("Set-Cookie", setAuthCookie(token));

    // Send login notification email (don't wait for it - send asynchronously)
    // Only send if SMTP is configured (to avoid errors in development)
    if (process.env.SMTP_HOST || process.env.NODE_ENV === 'production') {
      sendLoginNotificationEmail(user.email, user.name, {
        loginTime: new Date().toISOString(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }).catch((error) => {
        console.error('Failed to send login notification email:', error);
        // Don't fail the login if email fails
      });
    }

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
