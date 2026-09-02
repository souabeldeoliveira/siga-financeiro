import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { sessionCookieName, verifySessionToken } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/login/submit";
  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
