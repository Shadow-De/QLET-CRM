import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Shared Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * For public API routes (intake link submission, validation)
 * 10 requests per 15 minutes per IP
 */
export const publicApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
  prefix: "ratelimit:public",
});

/**
 * For auth endpoints (forgot-password)
 * 5 requests per 60 minutes per IP
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

/**
 * Per-token intake link limiter (3 uses per hour per token)
 */
export const tokenLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 m"),
  analytics: true,
  prefix: "ratelimit:token",
});

/**
 * Gets the real client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
