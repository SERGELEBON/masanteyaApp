import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { upload } from '../../shared/middleware/upload'
import { InsuranceController } from './insurance.controller'
import {
  createInsuranceSchema,
  updateInsuranceSchema,
  checkCoverageSchema,
} from './insurance.schema'

const router = Router()

router.post('/', authenticate, upload.single('cardImage'), validate(createInsuranceSchema), InsuranceController.createInsurance)
router.get('/', authenticate, InsuranceController.getInsurances)
router.get('/:id', authenticate, InsuranceController.getInsurance)
router.put('/:id', authenticate, validate(updateInsuranceSchema), InsuranceController.updateInsurance)
router.delete('/:id', authenticate, InsuranceController.deleteInsurance)
router.post('/:id/card-image', authenticate, upload.single('cardImage'), InsuranceController.uploadCardImage)
router.post('/:id/check-coverage', authenticate, validate(checkCoverageSchema), InsuranceController.checkCoverage)

export default router
