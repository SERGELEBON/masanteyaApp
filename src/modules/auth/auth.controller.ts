import { Request, Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { AuthService } from './auth.service'
import { ApiResponse } from '../../shared/utils/response'

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body)
      return ApiResponse.created(res, result, 'Inscription réussie')
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const result = await AuthService.login(email, password)
      return ApiResponse.success(res, result, 'Connexion réussie')
    } catch (error) {
      return ApiResponse.unauthorized(res, (error as Error).message)
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body
      const result = await AuthService.refresh(refreshToken)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.unauthorized(res, (error as Error).message)
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      const accessToken = req.headers.authorization?.slice(7) || ''
      const { refreshToken } = req.body
      const result = await AuthService.logout(accessToken, refreshToken)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { userId, code, type } = req.body
      const result = await AuthService.verifyOtp(userId, code, type)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      const result = await AuthService.forgotPassword(email)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body
      const result = await AuthService.resetPassword(email, code, newPassword)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }

  static async resendOtp(req: Request, res: Response) {
    try {
      const { userId, type } = req.body
      const result = await AuthService.resendOtp(userId, type)
      return ApiResponse.success(res, result)
    } catch (error) {
      return ApiResponse.error(res, (error as Error).message)
    }
  }
}
