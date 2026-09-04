import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis() {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return null
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

// 10 requests per hour per IP (for public form page loads)
export const ipRatelimit = (() => {
  const r = getRedis()
  if (!r) return null
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:ip',
  })
})()

// 5 submissions per hour per token
export const tokenRatelimit = (() => {
  const r = getRedis()
  if (!r) return null
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'rl:token',
  })
})()

// Login rate limit: 10 attempts per 15 minutes per IP
export const loginRatelimit = (() => {
  const r = getRedis()
  if (!r) return null
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    prefix: 'rl:login',
  })
})()

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}
