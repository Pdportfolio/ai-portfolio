import { sendVisitorMessage } from "../../lib/mail";
import { clientIp } from "../../lib/request-ip";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const { name, email, phone, message } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof message !== "string"
  ) {
    return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const result = await sendVisitorMessage({
    name,
    email,
    phone,
    message,
    ip: clientIp(request),
  });
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
