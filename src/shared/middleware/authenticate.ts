import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import { JwtHelper } from '../utils/jwt'
import { ApiResponse } from '../utils/response'
import { CacheService } from '../services/cache.service'
import { prisma } from '../../config/database'

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Token manquant')
      return
    }

    const token = authHeader.slice(7)

    const isBlacklisted = await CacheService.get<string>(`blacklist:${token}`)
    if (isBlacklisted) {
      ApiResponse.unauthorized(res, 'Session expirée')
      return
    }

    const payload = JwtHelper.verifyAccessToken(token)

    const cacheKey = CacheService.buildKey('user_active', payload.sub)
    let isActive = await CacheService.get<boolean>(cacheKey)

    if (isActive === null) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { isActive: true },
      })

      if (!user?.isActive) {
        ApiResponse.unauthorized(res, 'Compte désactivé')
        return
      }

      await CacheService.set(cacheKey, true, 300)
      isActive = true
    }

    if (!isActive) {
      ApiResponse.unauthorized(res, 'Compte désactivé')
      return
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      country: payload.country,
      email: payload.email,
    }

    next()
  } catch (error) {
    ApiResponse.unauthorized(res, 'Token invalide ou expiré')
  }
}
