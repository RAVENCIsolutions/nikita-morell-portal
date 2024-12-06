import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { validateRefreshToken, updateUserSession } from "@/lib/notion";
import type { RefreshResponse } from "@/types/auth";

export async function POST(
  request: Request,
): Promise<NextResponse<RefreshResponse>> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 },
      );
    }

    const validatedUser = await validateRefreshToken(refreshToken);

    if (!validatedUser) {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 },
      );
    }

    // Generate new session token
    const newSessionToken = randomBytes(32).toString("base64");
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update session in database
    await updateUserSession({
      email: validatedUser.email,
      sessionToken: newSessionToken,
      refreshToken, // keep the same refresh token
      sessionExpiry,
      refreshExpiry: validatedUser.refreshExpiry,
      userAgent: request.headers.get("user-agent") || "Unknown",
    });

    // Create response with new session token
    const response = NextResponse.json({
      success: true,
      message: "Session renewed",
      newSessionToken,
    });

    // Set new session cookie
    response.cookies.set({
      name: "session_token",
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: sessionExpiry,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
