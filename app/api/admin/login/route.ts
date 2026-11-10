import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  passwordsMatch,
  signAdminSession,
} from "../../../lib/admin-auth";
import { LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_SECONDS, loginRateKey, rateLimit } from "../../../lib/rate-limit";
import { clientIp } from "../../../lib/request-ip";

const GENERIC_ERROR = "Could not sign in.";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.ADMIN_SESSION_SECRET) {
    return Response.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  try {
    const limited = await rateLimit(loginRateKey(clientIp(request)), LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_SECONDS);
    if (!limited.ok) {
      return Response.json({ error: GENERIC_ERROR }, { status: 429 });
    }
  } catch (error) {
    console.error("Admin login rate limit unavailable.", error);
    return Response.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  if (!passwordsMatch(password, expected)) {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await signAdminSession(), adminCookieOptions());
  return Response.json({ ok: true });
}
