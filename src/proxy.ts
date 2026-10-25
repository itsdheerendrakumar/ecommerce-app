import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const refresh_token = request.cookies.get("refresh_token")?.value;

  if (!refresh_token) {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!(?:api|login|signup)(?:/|$)|_next/static|_next/image|favicon\\.ico$).+)",
  ],
};