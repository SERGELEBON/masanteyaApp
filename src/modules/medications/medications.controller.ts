import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { MedicationsService } from './medications.service'

export class MedicationsController {
  static async createMedication(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const medication = await MedicationsService.createMedication(userId, req.body)
      return ApiResponse.success(res, medication, 'Médicament ajouté', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getMedications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const result = await MedicationsService.getMedications(userId, req.query)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getMedication(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const medication = await MedicationsService.getMedication(userId, id)
      return ApiResponse.success(res, medication)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateMedication(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const medication = await MedicationsService.updateMedication(userId, id, req.body)
      return ApiResponse.success(res, medication, 'Médicament mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteMedication(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const result = await MedicationsService.deleteMedication(userId, id)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async recordIntake(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const intake = await MedicationsService.recordIntake(userId, id, req.body)
      return ApiResponse.success(res, intake, 'Prise enregistrée', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getIntakeHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const intakes = await MedicationsService.getIntakeHistory(userId, id)
      return ApiResponse.success(res, intakes)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getTodaySchedule(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const schedule = await MedicationsService.getTodaySchedule(userId)
      return ApiResponse.success(res, schedule)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}
