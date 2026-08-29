"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSessionToken, sessionCookieName } from "@/lib/session-token";

export type LoginState = { error?: string } | undefined;

function passwordsMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const expected = process.env.SIGA_ADMIN_PASSWORD;

  if (typeof password !== "string" || !expected || !passwordsMatch(password, expected)) {
    return { error: "Senha incorreta." };
  }

  const token = await createSessionToken({ userId: "local-admin", role: "ADMIN" });
  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
    priority: "high",
  });

  redirect("/dashboard");
}

export async function logout() {
  (await cookies()).delete(sessionCookieName);
  redirect("/login");
}
