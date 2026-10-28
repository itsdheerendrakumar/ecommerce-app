import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwtPayload(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr =
      typeof Buffer !== "undefined"
        ? Buffer.from(base64, "base64").toString("utf-8")
        : atob(base64);
    const payload = JSON.parse(jsonStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const payload = parseJwtPayload(accessToken) || parseJwtPayload(refreshToken);
  const role = payload?.data?.role;

  // 1. Storefront routes: Disallow admin and redirect to admin dashboard
  const isStorefront =
    pathname === "/" ||
    pathname.startsWith("/shop") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/product");

  if (isStorefront && role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // 2. Protected routes: Require active session and appropriate role
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/customer") ||
    pathname.startsWith("/delivery");

  if (isProtected) {
    if (!payload) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(
        new URL(role === "delivery-partner" ? "/delivery" : "/", request.url)
      );
    }

    if (pathname.startsWith("/delivery") && role !== "delivery-partner") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/", request.url)
      );
    }

    if (pathname.startsWith("/customer") && role !== "customer") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/delivery", request.url)
      );
    }
  }

  // 3. Auth routes: If already logged in, redirect away to their respective portal
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  if (isAuthRoute && payload) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "delivery-partner") {
      return NextResponse.redirect(new URL("/delivery", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico).*)",
  ],
};