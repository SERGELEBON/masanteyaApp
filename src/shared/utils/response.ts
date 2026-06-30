import { Response } from 'express'

export interface ApiSuccessResponse<T = unknown> {
  success: true
  message?: string
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors?: unknown
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    }
    return res.status(statusCode).json(response)
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: unknown
  ): Response {
    const response: ApiErrorResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    }
    return res.status(statusCode).json(response)
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return ApiResponse.success(res, data, message, 201)
  }

  static noContent(res: Response): Response {
    return res.status(204).send()
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return ApiResponse.error(res, message, 401)
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return ApiResponse.error(res, message, 403)
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return ApiResponse.error(res, message, 404)
  }

  static serverError(res: Response, message: string = 'Internal server error'): Response {
    return ApiResponse.error(res, message, 500)
  }
}
