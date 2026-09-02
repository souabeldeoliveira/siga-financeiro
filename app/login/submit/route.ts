import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { createSessionToken, sessionCookieName } from "@/lib/session-token";

export const runtime = "nodejs";

function passwordsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const expected = process.env.SIGA_ADMIN_PASSWORD;

  if (typeof password !== "string" || !expected || !passwordsMatch(password, expected)) {
    return NextResponse.redirect(new URL("/login?erro=senha", request.url), 303);
  }

  const token = await createSessionToken({ userId: "local-admin", role: "ADMIN" });
  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
    priority: "high",
  });
  return response;
}
