import { getAdminSession } from "../../../lib/admin-auth";
import { getLiveProfile, parseCurrentPosition, setLiveProfile, type LiveProfile } from "../../../lib/profile";

const ROLE_MAX = 80;
const BLURB_MAX = 240;
const TITLE_MAX = 80;
const COMPANY_MAX = 80;
const BULLET_MAX = 400;
const BULLET_LIMIT = 12;

function asProfile(value: unknown): LiveProfile | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.role !== "string") return null;
  if (typeof record.focusBlurb !== "string") return null;
  if (typeof record.openToWork !== "boolean") return null;
  const role = record.role.trim();
  const focusBlurb = record.focusBlurb.trim();
  if (!role || role.length > ROLE_MAX || focusBlurb.length > BLURB_MAX) return null;

  let currentPosition = null;
  if (record.currentPosition !== null && record.currentPosition !== undefined) {
    currentPosition = parseCurrentPosition(record.currentPosition);
    if (!currentPosition) return null;
    if (currentPosition.title.length > TITLE_MAX || currentPosition.company.length > COMPANY_MAX) return null;
    if (currentPosition.bullets.length > BULLET_LIMIT || currentPosition.bullets.some((bullet) => bullet.length > BULLET_MAX)) {
      return null;
    }
  }

  return { role, focusBlurb, openToWork: record.openToWork, currentPosition };
}

export async function GET() {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  return Response.json(await getLiveProfile());
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid profile." }, { status: 400 });
  }

  const profile = asProfile(body);
  if (!profile) {
    return Response.json({ error: "Invalid profile." }, { status: 400 });
  }

  await setLiveProfile(profile);
  return Response.json(profile);
}
