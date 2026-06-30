import { Response, NextFunction } from 'express'
import { AuthRequest, UserRole } from '../types'
import { ApiResponse } from '../utils/response'

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res)
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return ApiResponse.forbidden(res, 'Accès refusé')
    }

    next()
  }
}