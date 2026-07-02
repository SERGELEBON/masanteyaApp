import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { RecordsService } from './records.service'

export class RecordsController {
  static async createRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const files = req.files as Express.Multer.File[] | undefined

      const record = await RecordsService.createRecord(userId, req.body, files)
      return ApiResponse.success(res, record, 'Dossier médical créé', 201)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getRecords(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const result = await RecordsService.getRecords(userId, req.query)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const record = await RecordsService.getRecord(userId, id)
      return ApiResponse.success(res, record)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const record = await RecordsService.updateRecord(userId, id, req.body)
      return ApiResponse.success(res, record, 'Dossier médical mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async deleteRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const result = await RecordsService.deleteRecord(userId, id)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async shareRecord(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const record = await RecordsService.shareRecord(userId, id, req.body)
      return ApiResponse.success(res, record, 'Dossier partagé avec succès')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async uploadFiles(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params
      const files = req.files as Express.Multer.File[]

      if (!files || files.length === 0) {
        return ApiResponse.error(res, 'Fichiers manquants', 400)
      }

      const record = await RecordsService.uploadFiles(userId, id, files)
      return ApiResponse.success(res, record, 'Fichiers ajoutés avec succès')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }
}