import "server-only";

import { timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_HOURS = 4;
const ADMIN_MAX_AGE = ADMIN_SESSION_HOURS * 60 * 60;

function secretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session is not configured.");
  return new TextEncoder().encode(secret);
}

export function passwordsMatch(provided: string, expected: string) {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  const size = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(size);
  const paddedRight = Buffer.alloc(size);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
}

export async function signAdminSession() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifyAdminSession(token: string) {
  const { payload } = await jwtVerify(token, secretKey());
  return payload.sub === "admin";
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  };
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    return await verifyAdminSession(token);
  } catch {
    return false;
  }
}
