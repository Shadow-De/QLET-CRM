import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazily create a Redis instance only when env vars are present
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Dummy limiter that always passes when Redis is not configured
const noopResult = { success: true, limit: 999, remaining: 998, reset: 0, pending: Promise.resolve() };
const noopLimiter = { limit: async (_id: string) => noopResult } as unknown as Ratelimit;

function makeLimiter(type: "slidingWindow", requests: number, window: string, prefix: string): Ratelimit {
  const redis = getRedis();
  if (!redis) {
    console.warn(`[RateLimit] Upstash Redis not configured — rate limiting disabled for "${prefix}"`);
    return noopLimiter;
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
    analytics: true,
    prefix,
  });
}

/**
 * For public API routes (intake link submission, validation)
 * 10 requests per 15 minutes per IP
 */
export const publicApiLimiter = makeLimiter("slidingWindow", 10, "15 m", "ratelimit:public");

/**
 * For auth endpoints (forgot-password)
 * 5 requests per 60 minutes per IP
 */
export const authLimiter = makeLimiter("slidingWindow", 5, "60 m", "ratelimit:auth");

/**
 * Per-token intake link limiter (3 uses per hour per token)
 */
export const tokenLimiter = makeLimiter("slidingWindow", 3, "60 m", "ratelimit:token");

/**
 * Gets the real client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
