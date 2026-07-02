import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { VitalsService } from './vitals.service'

export class VitalsController {
  static async createVital(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id

      const vital = await VitalsService.createVital(userId, req.body)
      return ApiResponse.success(res, vital, 'Signe vital enregistré', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getVitals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const vitals = await VitalsService.getVitals(userId, req.query)
      return ApiResponse.success(res, vitals)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getVital(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const vital = await VitalsService.getVital(userId, id)
      return ApiResponse.success(res, vital)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteVital(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const result = await VitalsService.deleteVital(userId, id)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getVitalStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const stats = await VitalsService.getVitalStats(userId)
      return ApiResponse.success(res, stats)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}