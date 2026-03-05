import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "siarom-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Public routes
  if (pathname === "/login" || pathname === "/setup" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Client routes
  if (pathname.startsWith("/c/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Root → redirect to login if no session; if has token, let page.tsx redirect (admin vs client)
  if (pathname === "/") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/c/:path*", "/login", "/setup"],
};
