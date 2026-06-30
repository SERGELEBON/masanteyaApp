import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { ApiResponse } from '../../shared/utils/response'

const router = Router()

router.get('/search', authenticate, (req, res) => {
  ApiResponse.success(res, { message: 'TODO: Implement pharmfind module with Haversine query' })
})

export default router
