import { prisma } from '../../config/database'
import { logger } from '../../config/logger'

export interface CreateNotificationParams {
  userId: string
  title: string
  body: string
  type: string
  data?: Record<string, unknown>
}

export class NotificationService {
  static async send(params: CreateNotificationParams): Promise<boolean> {
    try {
      await prisma.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          body: params.body,
          type: params.type,
          data: (params.data as any) || {},
        },
      })

      logger.info(`Notification sent to user ${params.userId}: ${params.title}`)
      return true
    } catch (error) {
      logger.error('Notification service error:', error)
      return false
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      })
      return true
    } catch (error) {
      logger.error('Mark notification as read error:', error)
      return false
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
      return true
    } catch (error) {
      logger.error('Mark all notifications as read error:', error)
      return false
    }
  }
}
