import { Request, Response, NextFunction } from 'express'
import { logger } from '../../config/logger'
import { env } from '../../config/env'
import { ApiResponse } from '../utils/response'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  })

  if (err.name === 'UnauthorizedError') {
    return ApiResponse.unauthorized(res, 'Token invalide')
  }

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, err.message, 400)
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return ApiResponse.error(res, 'Erreur de base de données', 500)
  }

  const message =
    env.NODE_ENV === 'production' ? 'Une erreur interne est survenue' : err.message

  return ApiResponse.serverError(res, message)
}