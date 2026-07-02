import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { MedicationsController } from './medications.controller'
import {
  createMedicationSchema,
  updateMedicationSchema,
  getMedicationsQuerySchema,
  recordIntakeSchema,
} from './medications.schema'

const router = Router()

router.post('/', authenticate, validate(createMedicationSchema), MedicationsController.createMedication)
router.get('/', authenticate, validate(getMedicationsQuerySchema), MedicationsController.getMedications)
router.get('/schedule/today', authenticate, MedicationsController.getTodaySchedule)
router.get('/:id', authenticate, MedicationsController.getMedication)
router.put('/:id', authenticate, validate(updateMedicationSchema), MedicationsController.updateMedication)
router.delete('/:id', authenticate, MedicationsController.deleteMedication)
router.post('/:id/intake', authenticate, validate(recordIntakeSchema), MedicationsController.recordIntake)
router.get('/:id/intakes', authenticate, MedicationsController.getIntakeHistory)

export default router
