import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/middleware-auth";

// ============================================================================
// Admin Route Protection
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    // Allow login page
    if (pathname === "/admin/login") {
      // If already authenticated, redirect to admin dashboard
      if (isAuthenticated(request)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Protect all other admin routes
    if (!isAuthenticated(request)) {
      // Store the original URL to redirect back after login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// ============================================================================
// Matcher Configuration
// ============================================================================

export const config = {
  matcher: ["/admin/:path*"],
};
