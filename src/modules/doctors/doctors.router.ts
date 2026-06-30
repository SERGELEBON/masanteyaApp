import { Router } from 'express'
import { ApiResponse } from '../../shared/utils/response'

const router = Router()

router.get('/', (req, res) => {
  ApiResponse.success(res, { message: 'TODO: Implement doctors module' })
})

export default router
