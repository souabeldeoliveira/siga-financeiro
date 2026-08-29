import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { sessionCookieName, verifySessionToken } from "@/lib/session-token";

export const getSession = cache(async () => {
  const token = (await cookies()).get(sessionCookieName)?.value;
  return verifySessionToken(token);
});

export const requireAdmin = cache(async () => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  return session;
});
