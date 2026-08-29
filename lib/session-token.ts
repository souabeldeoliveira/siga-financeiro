import { jwtVerify, SignJWT } from "jose";

export const sessionCookieName = "siga_session";

export type SessionPayload = {
  userId: string;
  role: "ADMIN";
};

function secretKey() {
  const secret = process.env.SIGA_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SIGA_SESSION_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

export async function verifySessionToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.userId || payload.role !== "ADMIN") return null;
    return payload;
  } catch {
    return null;
  }
}
