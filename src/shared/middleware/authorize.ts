import { Response, NextFunction } from 'express'
import { AuthRequest, UserRole } from '../types'
import { ApiResponse } from '../utils/response'

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res)
      return
    }

    if (!roles.includes(req.user.role as UserRole)) {
      ApiResponse.forbidden(res, 'Accès refusé')
      return
    }

    next()
  }
}