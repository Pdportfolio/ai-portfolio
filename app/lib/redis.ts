import "server-only";

import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function getRedis() {
  if (client) return client;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Redis is not configured.");
  }
  client = Redis.fromEnv({ cache: "no-store" });
  return client;
}
