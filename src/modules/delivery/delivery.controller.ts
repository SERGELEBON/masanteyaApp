import { Response } from 'express'
import { AuthRequest } from '../../shared/types'
import { ApiResponse } from '../../shared/utils/response'
import { DeliveryService } from './delivery.service'
import { logger } from '../../config/logger'

export class DeliveryController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const order = await DeliveryService.createOrder(userId, req.body)
      return ApiResponse.success(res, order, 'Commande créée', 201)
    } catch (error: any) {
      logger.error('Error creating order:', { error: error.message, userId: req.user?.id, body: req.body })
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const result = await DeliveryService.getOrders(userId, req.query)
      return ApiResponse.success(res, result)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async getOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const order = await DeliveryService.getOrder(userId, id)
      return ApiResponse.success(res, order)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const order = await DeliveryService.updateOrder(userId, id, req.body)
      return ApiResponse.success(res, order, 'Commande mise à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const order = await DeliveryService.updateStatus(id, req.body)
      return ApiResponse.success(res, order, 'Statut mis à jour')
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async updateCourierLocation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      const order = await DeliveryService.updateCourierLocation(id, req.body)
      return ApiResponse.success(res, order)
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400)
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const order = await DeliveryService.cancelOrder(userId, id)
      return ApiResponse.success(res, order, 'Commande annulée')
    } catch (error: any) {
      const { id } = req.params
      logger.error('Error canceling order:', { error: error.message, orderId: id, userId: req.user?.id })
      return ApiResponse.error(res, error.message, 400)
    }
  }
}