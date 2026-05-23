import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PB_AUTH_COOKIE } from "@/lib/pocketbase";

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(PB_AUTH_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname === "/login" && cookie?.value) {
    const target = request.nextUrl.searchParams.get("redirect");
    const safe =
      target?.startsWith("/admin") && !target.startsWith("//")
        ? target
        : "/admin";
    return NextResponse.redirect(new URL(safe, request.url));
  }

  if (pathname.startsWith("/admin") && !cookie?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login"],
};
