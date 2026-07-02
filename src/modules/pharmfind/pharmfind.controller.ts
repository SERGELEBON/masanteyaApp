import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { PharmFindService } from './pharmfind.service'
import { logger } from '../../config/logger'

export class PharmFindController {
  static async searchPharmacies(req: AuthRequest, res: Response) {
    try {
      const pharmacies = await PharmFindService.searchPharmacies(req.query as any)
      return ApiResponse.success(res, pharmacies)
    } catch (error: any) {
      logger.error('Error searching pharmacies:', { error: error.message, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async searchMedication(req: AuthRequest, res: Response) {
    try {
      const results = await PharmFindService.searchMedication(req.query as any)
      return ApiResponse.success(res, results)
    } catch (error: any) {
      logger.error('Error searching medication:', { error: error.message, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getPharmacy(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const pharmacy = await PharmFindService.getPharmacy(id)
      return ApiResponse.success(res, pharmacy)
    } catch (error: any) {
      const { id } = req.params
      logger.error('Error getting pharmacy:', { error: error.message, pharmacyId: id, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getPharmacyStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const { medication } = req.query

      const stock = await PharmFindService.getPharmacyStock(id, medication as string)
      return ApiResponse.success(res, stock)
    } catch (error: any) {
      const { id } = req.params
      logger.error('Error getting pharmacy stock:', { error: error.message, pharmacyId: id, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getNearbyOnDuty(req: AuthRequest, res: Response) {
    try {
      const { latitude, longitude } = req.query

      if (!latitude || !longitude) {
        return ApiResponse.error(res, 'Coordonnées requises', 400)
      }

      const pharmacies = await PharmFindService.getNearbyOnDutyPharmacies(
        Number(latitude),
        Number(longitude)
      )
      return ApiResponse.success(res, pharmacies)
    } catch (error: any) {
      logger.error('Error getting nearby on-duty pharmacies:', { error: error.message, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }
}