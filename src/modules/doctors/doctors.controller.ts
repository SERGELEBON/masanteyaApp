import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { DoctorsService } from './doctors.service'

export class DoctorsController {
  static async getDoctors(req: AuthRequest, res: Response) {
    try {
      const result = await DoctorsService.getDoctors(req.query)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getDoctor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const doctor = await DoctorsService.getDoctor(id)
      return ApiResponse.success(res, doctor)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const doctor = await DoctorsService.getDoctorProfile(userId)
      return ApiResponse.success(res, doctor)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateMyProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const doctor = await DoctorsService.updateDoctorProfile(userId, req.body)
      return ApiResponse.success(res, doctor, 'Profil mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateOnlineStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const doctor = await DoctorsService.updateOnlineStatus(userId, req.body)
      return ApiResponse.success(res, doctor, 'Statut mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async setAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const availability = await DoctorsService.setAvailability(userId, req.body)
      return ApiResponse.success(res, availability, 'Disponibilité ajoutée', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getAvailabilities(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const availabilities = await DoctorsService.getAvailabilities(userId)
      return ApiResponse.success(res, availabilities)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteAvailability(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const result = await DoctorsService.deleteAvailability(userId, id)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}
