import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { upload } from '../../shared/middleware/upload'
import { ConsultationsController } from './consultations.controller'
import {
  createConsultationSchema,
  updateConsultationSchema,
  updateStatusSchema,
  getConsultationsQuerySchema,
  sendMessageSchema,
  createReviewSchema,
} from './consultations.schema'

const router = Router()

router.post('/', authenticate, validate(createConsultationSchema), ConsultationsController.createConsultation)
router.get('/', authenticate, validate(getConsultationsQuerySchema), ConsultationsController.getConsultations)
router.get('/:id', authenticate, ConsultationsController.getConsultation)
router.put('/:id', authenticate, validate(updateConsultationSchema), ConsultationsController.updateConsultation)
router.patch('/:id/status', authenticate, validate(updateStatusSchema), ConsultationsController.updateStatus)
router.delete('/:id', authenticate, ConsultationsController.cancelConsultation)
router.post('/:id/messages', authenticate, upload.single('file'), validate(sendMessageSchema), ConsultationsController.sendMessage)
router.get('/:id/messages', authenticate, ConsultationsController.getMessages)
router.post('/:id/review', authenticate, validate(createReviewSchema), ConsultationsController.createReview)

export default router
