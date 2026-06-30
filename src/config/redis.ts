import { Redis } from '@upstash/redis'
import { env } from './env'

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export class RedisHelper {
  static async get(key: string): Promise<string | null> {
    return await redis.get(key)
  }

  static async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    if (expirySeconds) {
      await redis.setex(key, expirySeconds, value)
    } else {
      await redis.set(key, value)
    }
  }

  static async setex(key: string, expirySeconds: number, value: string): Promise<void> {
    await redis.setex(key, expirySeconds, value)
  }

  static async del(key: string): Promise<void> {
    await redis.del(key)
  }

  static async incr(key: string): Promise<number> {
    return await redis.incr(key)
  }

  static async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds)
  }

  static async ttl(key: string): Promise<number> {
    return await redis.ttl(key)
  }
}
