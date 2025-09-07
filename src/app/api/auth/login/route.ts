import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { setAuthCookie } from "@/lib/cookies";

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

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
