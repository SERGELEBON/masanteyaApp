import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { ApiResponse } from '../../shared/utils/response'

const router = Router()

router.get('/pharmacies', authenticate, (req, res) => {
  ApiResponse.success(res, { message: 'TODO: Implement delivery module' })
})

export default router
