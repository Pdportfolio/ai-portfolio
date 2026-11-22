import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 15 * 60 * 1000;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return value;
}

export function signDraftToken(): string {
  const issuedAt = Date.now().toString();
  const sig = createHmac("sha256", secret()).update(issuedAt).digest("base64url");
  return `${issuedAt}.${sig}`;
}

export function verifyDraftToken(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  const expected = createHmac("sha256", secret()).update(issuedAt).digest("base64url");
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Date.now() - Number(issuedAt) <= TOKEN_TTL_MS;
}