import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { PharmFindController } from './pharmfind.controller'
import { searchPharmaciesSchema, searchMedicationSchema } from './pharmfind.schema'

const router = Router()

router.get('/search', authenticate, validate(searchPharmaciesSchema), PharmFindController.searchPharmacies)
router.get('/medication/search', authenticate, validate(searchMedicationSchema), PharmFindController.searchMedication)
router.get('/on-duty', authenticate, PharmFindController.getNearbyOnDuty)
router.get('/:id', authenticate, PharmFindController.getPharmacy)
router.get('/:id/stock', authenticate, PharmFindController.getPharmacyStock)

export default router
