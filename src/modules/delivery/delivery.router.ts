import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { authorize } from '../../shared/middleware/authorize'
import { validate } from '../../shared/middleware/validate'
import { DeliveryController } from './delivery.controller'
import {
  createOrderSchema,
  updateOrderSchema,
  updateStatusSchema,
  updateCourierLocationSchema,
  getOrdersQuerySchema,
} from './delivery.schema'

const router = Router()

router.post('/orders', authenticate, validate(createOrderSchema), DeliveryController.createOrder)
router.get('/orders', authenticate, validate(getOrdersQuerySchema), DeliveryController.getOrders)
router.get('/orders/:id', authenticate, DeliveryController.getOrder)
router.put('/orders/:id', authenticate, validate(updateOrderSchema), DeliveryController.updateOrder)
router.patch('/orders/:id/status', authenticate, authorize('ADMIN', 'PHARMACIST'), validate(updateStatusSchema), DeliveryController.updateStatus)
router.patch('/orders/:id/location', authenticate, validate(updateCourierLocationSchema), DeliveryController.updateCourierLocation)
router.delete('/orders/:id', authenticate, DeliveryController.cancelOrder)

export default router
