import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { ConsultationsService } from './consultations.service'

export class ConsultationsController {
  static async createConsultation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const consultation = await ConsultationsService.createConsultation(userId, req.body)
      return ApiResponse.success(res, consultation, 'Consultation créée', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getConsultations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const role = req.user!.role
      const result = await ConsultationsService.getConsultations(userId, role, req.query)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getConsultation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const consultation = await ConsultationsService.getConsultation(userId, id)
      return ApiResponse.success(res, consultation)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateConsultation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const consultation = await ConsultationsService.updateConsultation(userId, id, req.body)
      return ApiResponse.success(res, consultation, 'Consultation mise à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const consultation = await ConsultationsService.updateStatus(userId, id, req.body)
      return ApiResponse.success(res, consultation, 'Statut mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async cancelConsultation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const consultation = await ConsultationsService.cancelConsultation(userId, id)
      return ApiResponse.success(res, consultation, 'Consultation annulée')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const file = req.file

      const message = await ConsultationsService.sendMessage(userId, id, req.body, file)
      return ApiResponse.success(res, message, 'Message envoyé', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const messages = await ConsultationsService.getMessages(userId, id)
      return ApiResponse.success(res, messages)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async createReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const review = await ConsultationsService.createReview(userId, id, req.body)
      return ApiResponse.success(res, review, 'Avis ajouté', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}