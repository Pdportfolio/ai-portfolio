import "server-only";

import { connection } from "next/server";
import { revalidatePath } from "next/cache";
import { person } from "./content";
import { getRedis } from "./redis";
import type { CurrentPosition, LiveProfile } from "./profile-types";

export type { CurrentPosition, LiveProfile } from "./profile-types";

export const PROFILE_KEY = "profile:live";

export const DEFAULT_LIVE_PROFILE: LiveProfile = {
  role: person.role,
  focusBlurb: "",
  openToWork: false,
  currentPosition: null,
};

export function parseCurrentPosition(value: unknown): CurrentPosition | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.title !== "string" || typeof record.company !== "string") return null;
  const title = record.title.trim();
  const company = record.company.trim();
  if (!title || !company) return null;
  const bullets = Array.isArray(record.bullets)
    ? record.bullets.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
  return { title, company, bullets };
}

function asLiveProfile(value: unknown): LiveProfile | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.role !== "string" || typeof record.focusBlurb !== "string" || typeof record.openToWork !== "boolean") {
    return null;
  }
  return {
    role: record.role,
    focusBlurb: record.focusBlurb,
    openToWork: record.openToWork,
    currentPosition: parseCurrentPosition(record.currentPosition),
  };
}

export function seedProfile(): LiveProfile {
  return { ...DEFAULT_LIVE_PROFILE, currentPosition: null };
}

export async function getLiveProfile(): Promise<LiveProfile> {
  await connection();
  try {
    const redis = getRedis();
    const stored = asLiveProfile(await redis.get<LiveProfile>(PROFILE_KEY));
    if (stored) return stored;
    const seeded = seedProfile();
    await redis.set(PROFILE_KEY, seeded);
    return seeded;
  } catch (error) {
    console.error("Live profile unavailable, using content.ts.", error);
    return seedProfile();
  }
}

export async function setLiveProfile(profile: LiveProfile) {
  const redis = getRedis();
  await redis.set(PROFILE_KEY, profile);
  revalidatePath("/");
  revalidatePath("/admin");
}
