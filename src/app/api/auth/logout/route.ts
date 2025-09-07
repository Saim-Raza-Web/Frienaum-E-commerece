import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Attach cookie invalidation
    response.headers.append("Set-Cookie", clearAuthCookie());

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
