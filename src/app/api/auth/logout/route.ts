import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear all auth cookies
    response.cookies.set({
      name: "session_token",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    response.cookies.set({
      name: "refresh_token",
      value: "",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during logout",
      },
      { status: 500 },
    );
  }
}
