import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import hpp from 'hpp'
import morgan from 'morgan'
import 'express-async-errors'

import { env } from './config/env'
import { apiLimiter } from './shared/middleware/rateLimiter'
import { errorHandler } from './shared/middleware/errorHandler'

import authRouter from './modules/auth/auth.router'
import usersRouter from './modules/users/users.router'
import doctorsRouter from './modules/doctors/doctors.router'
import consultationsRouter from './modules/consultations/consultations.router'
import vitalsRouter from './modules/vitals/vitals.router'
import recordsRouter from './modules/records/records.router'
import medicationsRouter from './modules/medications/medications.router'
import deliveryRouter from './modules/delivery/delivery.router'
import insuranceRouter from './modules/insurance/insurance.router'
import pharmfindRouter from './modules/pharmfind/pharmfind.router'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  app.use(hpp())

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined'))
  }

  app.use('/api', apiLimiter)

  app.get('/health', (_, res) =>
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    })
  )

  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/doctors', doctorsRouter)
  app.use('/api/v1/consultations', consultationsRouter)
  app.use('/api/v1/vitals', vitalsRouter)
  app.use('/api/v1/records', recordsRouter)
  app.use('/api/v1/medications', medicationsRouter)
  app.use('/api/v1/delivery', deliveryRouter)
  app.use('/api/v1/insurance', insuranceRouter)
  app.use('/api/v1/pharmfind', pharmfindRouter)

  app.use((_req, res) => res.status(404).json({ message: 'Route introuvable' }))

  app.use(errorHandler)

  return app
}
