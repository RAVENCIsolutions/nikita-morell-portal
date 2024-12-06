import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { randomBytes } from "crypto";

import { verifyCredentials, updateUserSession } from "@/lib/notion";
import { AuthResponse, NotionUser } from "@/types/notion";

export async function POST(
  request: Request,
): Promise<NextResponse<AuthResponse>> {
  try {
    const credentials: NotionUser = await request.json();
    const isAuthenticated = await verifyCredentials(credentials);

    if (isAuthenticated) {
      // Generate secure random tokens
      const sessionToken = randomBytes(32).toString("base64");
      const refreshToken = randomBytes(64).toString("base64");

      // Get user agent
      const userAgent = request.headers.get("user-agent") || "Unknown";

      // Set expiry times
      const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Update user session in Notion
      await updateUserSession({
        email: credentials.email,
        sessionToken,
        refreshToken,
        sessionExpiry,
        refreshExpiry,
        userAgent,
      });

      // Create the response
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      // Set cookies
      response.cookies.set({
        name: "session_token",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: sessionExpiry,
      });

      response.cookies.set({
        name: "refresh_token",
        value: refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: refreshExpiry,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
