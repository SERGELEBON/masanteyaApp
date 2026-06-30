import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { ApiResponse } from '../../shared/utils/response'

const router = Router()

router.get('/me', authenticate, (req, res) => {
  ApiResponse.success(res, { message: 'TODO: Implement users module' })
})

export default router
