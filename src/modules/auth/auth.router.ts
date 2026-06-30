import { Router } from 'express'
import { AuthController } from './auth.controller'
import { validate } from '../../shared/middleware/validate'
import { authenticate } from '../../shared/middleware/authenticate'
import { authLimiter, strictLimiter } from '../../shared/middleware/rateLimiter'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
} from './auth.schema'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), AuthController.register)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login)
router.post('/refresh', validate(refreshSchema), AuthController.refresh)
router.post('/logout', authenticate, AuthController.logout)
router.post('/verify-email', validate(verifyOtpSchema), AuthController.verifyOtp)
router.post('/verify-phone', validate(verifyOtpSchema), AuthController.verifyOtp)
router.post(
  '/forgot-password',
  strictLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword
)
router.post(
  '/reset-password',
  strictLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword
)
router.post('/resend-otp', strictLimiter, validate(resendOtpSchema), AuthController.resendOtp)

export default router
