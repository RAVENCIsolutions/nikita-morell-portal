import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateSession } from "@/lib/notion";

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        message: "No session token found",
      });
    }

    const isValid = await validateSession(sessionToken);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Session invalid",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Session valid",
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
