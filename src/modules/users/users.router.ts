import { Router } from 'express'
import { authenticate } from '../../shared/middleware/authenticate'
import { validate } from '../../shared/middleware/validate'
import { upload } from '../../shared/middleware/upload'
import { UsersController } from './users.controller'
import { updateProfileSchema } from './users.schema'

const router = Router()

router.get('/me', authenticate, UsersController.getMe)
router.put('/me', authenticate, validate(updateProfileSchema), UsersController.updateMe)
router.post('/me/avatar', authenticate, upload.single('avatar'), UsersController.uploadAvatar)
router.delete('/me', authenticate, UsersController.deleteAccount)
router.get('/me/stats', authenticate, UsersController.getStats)

export default router
