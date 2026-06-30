import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { ApiResponse } from '../../shared/utils/response'

const router = Router()

router.get('/', authenticate, (req, res) => {
  ApiResponse.success(res, { message: 'TODO: Implement consultations module' })
})

export default router
