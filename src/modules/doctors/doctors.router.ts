import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { authorize } from '../../shared/middleware/authorize'
import { validate } from '../../shared/middleware/validate'
import { DoctorsController } from './doctors.controller'
import {
  getDoctorsQuerySchema,
  updateDoctorProfileSchema,
  setAvailabilitySchema,
  updateOnlineStatusSchema,
} from './doctors.schema'

const router = Router()

router.get('/', authenticate, validate(getDoctorsQuerySchema), DoctorsController.getDoctors)
router.get('/me', authenticate, authorize('DOCTOR'), DoctorsController.getMyProfile)
router.put('/me', authenticate, authorize('DOCTOR'), validate(updateDoctorProfileSchema), DoctorsController.updateMyProfile)
router.patch('/me/status', authenticate, authorize('DOCTOR'), validate(updateOnlineStatusSchema), DoctorsController.updateOnlineStatus)
router.get('/me/availability', authenticate, authorize('DOCTOR'), DoctorsController.getAvailabilities)
router.post('/me/availability', authenticate, authorize('DOCTOR'), validate(setAvailabilitySchema), DoctorsController.setAvailability)
router.delete('/me/availability/:id', authenticate, authorize('DOCTOR'), DoctorsController.deleteAvailability)
router.get('/:id', authenticate, DoctorsController.getDoctor)

export default router
