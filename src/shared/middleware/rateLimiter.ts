import rateLimit from 'express-rate-limit'
import { CacheService } from '../services/cache.service'

interface RateLimitOptions {
  windowMs?: number
  max?: number
  message?: string
  skipSuccessfulRequests?: boolean
}

export function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Trop de requêtes, veuillez réessayer plus tard',
  skipSuccessfulRequests = false,
}: RateLimitOptions = {}) {
  return rateLimit({
    windowMs,
    max,
    message,
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    store: {
      async increment(key: string): Promise<{ totalHits: number; resetTime: Date | undefined }> {
        const fullKey = `rate_limit:${key}`
        const hits = await CacheService.incr(fullKey)

        if (hits === 1) {
          await CacheService.expire(fullKey, Math.ceil(windowMs / 1000))
        }

        const ttl = await CacheService.ttl(fullKey)
        const resetTime = ttl > 0 ? new Date(Date.now() + ttl * 1000) : undefined

        return {
          totalHits: hits,
          resetTime,
        }
      },
      async decrement(key: string): Promise<void> {
        const fullKey = `rate_limit:${key}`
        await CacheService.del(fullKey)
      },
      async resetKey(key: string): Promise<void> {
        const fullKey = `rate_limit:${key}`
        await CacheService.del(fullKey)
      },
    },
  })
}

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
})

export const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
})

export const strictLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Limite stricte atteinte, réessayez dans 1 heure',
})