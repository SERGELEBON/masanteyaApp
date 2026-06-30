import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

export interface JwtPayload {
  sub: string
  role: string
  country: string
  email: string
}

export class JwtHelper {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    })
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    })
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload
  }

  static decodeToken(token: string): JwtPayload | null {
    const decoded = jwt.decode(token)
    return decoded as JwtPayload | null
  }
}
