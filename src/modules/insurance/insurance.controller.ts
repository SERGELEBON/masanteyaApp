import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { InsuranceService } from './insurance.service'

export class InsuranceController {
  static async createInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const cardImage = req.file

      const insurance = await InsuranceService.createInsurance(userId, req.body, cardImage)
      return ApiResponse.success(res, insurance, 'Assurance ajoutée', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getInsurances(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const insurances = await InsuranceService.getInsurances(userId)
      return ApiResponse.success(res, insurances)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const insurance = await InsuranceService.getInsurance(userId, id)
      return ApiResponse.success(res, insurance)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const insurance = await InsuranceService.updateInsurance(userId, id, req.body)
      return ApiResponse.success(res, insurance, 'Assurance mise à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteInsurance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const result = await InsuranceService.deleteInsurance(userId, id)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async uploadCardImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const cardImage = req.file

      if (!cardImage) {
        return ApiResponse.error(res, 'Image de carte requise', 400)
      }

      const insurance = await InsuranceService.uploadCardImage(userId, id, cardImage)
      return ApiResponse.success(res, insurance, 'Image de carte téléchargée')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async checkCoverage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const coverage = await InsuranceService.checkCoverage(userId, id, req.body)
      return ApiResponse.success(res, coverage)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}