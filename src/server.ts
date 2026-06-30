import { createServer } from 'http'
import { createApp } from './app'
import { initSocket } from './config/socket'
import { env } from './config/env'
import { logger } from './config/logger'
import { startMedicationReminders } from './jobs/medication-reminders.job'

const app = createApp()
const httpServer = createServer(app)

initSocket(httpServer)

startMedicationReminders()

const PORT = env.PORT || 3000

httpServer.listen(PORT, () => {
  logger.info(`🚀 MaSanteYa API running on port ${PORT}`)
  logger.info(`📍 Environment: ${env.NODE_ENV}`)
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  httpServer.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})