import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { UsersService } from './users.service'

export class UsersController {
  static async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const user = await UsersService.getProfile(userId)
      return ApiResponse.success(res, user)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const user = await UsersService.updateProfile(userId, req.body)
      return ApiResponse.success(res, user, 'Profil mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id

      if (!req.file) {
        return ApiResponse.error(res, 'Fichier manquant', 400)
      }

      const user = await UsersService.uploadAvatar(userId, req.file)
      return ApiResponse.success(res, user, 'Avatar mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const result = await UsersService.deleteAccount(userId)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const stats = await UsersService.getStats(userId)
      return ApiResponse.success(res, stats)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}