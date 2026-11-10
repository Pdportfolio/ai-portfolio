import "server-only";

import { getRedis } from "./redis";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
};

export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_SECONDS = 15 * 60;
export const EMAIL_RATE_LIMIT = 3;
export const EMAIL_RATE_WINDOW_SECONDS = 60 * 60;

export function loginRateKey(ip: string) {
  return `ratelimit:login:${ip}`;
}

export function emailRateKey(ip: string) {
  return `ratelimit:email:${ip}`;
}
