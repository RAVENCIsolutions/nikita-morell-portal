// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "@/lib/notion";

export async function middleware(request: NextRequest) {
  // Define public paths that don't need authentication
  const publicPaths = ["/get-access", "/api/auth", "/api/signup"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for session token
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    // If it's an API route, return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }
    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const isValid = await validateSession(sessionToken);

    if (!isValid) {
      // Try refresh token
      const refreshToken = request.cookies.get("refresh_token")?.value;

      if (refreshToken) {
        // Attempt to refresh the session
        const refreshResponse = await fetch(
          new URL("/api/refresh", request.url),
          {
            method: "POST",
            headers: {
              Cookie: `refresh_token=${refreshToken}`,
            },
          },
        );

        if (refreshResponse.ok) {
          // Allow the request to continue - the refresh API will set new cookies
          return NextResponse.next();
        }
      }

      // If we get here, both session and refresh failed
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Session expired" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
