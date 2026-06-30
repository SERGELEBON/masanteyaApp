import { redis } from '../../config/redis'
import { logger } from '../../config/logger'

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (!value) return null
      return JSON.parse(value as string) as T
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      logger.error('Cache set error:', error)
      return false
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      logger.error('Cache delete error:', error)
      return false
    }
  }

  static async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key)
    } catch (error) {
      logger.error('Cache increment error:', error)
      return 0
    }
  }

  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await redis.expire(key, seconds)
      return true
    } catch (error) {
      logger.error('Cache expire error:', error)
      return false
    }
  }

  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key)
    } catch (error) {
      logger.error('Cache TTL error:', error)
      return -1
    }
  }

  static buildKey(...parts: (string | number)[]): string {
    return parts.join(':')
  }
}
