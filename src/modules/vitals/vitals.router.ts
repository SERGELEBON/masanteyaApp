import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { VitalsController } from './vitals.controller'
import { createVitalSchema, getVitalsQuerySchema } from './vitals.schema'

const router = Router()

router.post('/', authenticate, validate(createVitalSchema), VitalsController.createVital)
router.get('/', authenticate, validate(getVitalsQuerySchema), VitalsController.getVitals)
router.get('/stats', authenticate, VitalsController.getVitalStats)
router.get('/:id', authenticate, VitalsController.getVital)
router.delete('/:id', authenticate, VitalsController.deleteVital)

export default router
