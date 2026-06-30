import cron from 'node-cron'
import { prisma } from '../config/database'
import { SmsService } from '../shared/services/sms.service'
import { NotificationService } from '../shared/services/notification.service'
import { logger } from '../config/logger'

export function startMedicationReminders() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date()
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000)

      const upcomingIntakes = await prisma.medicationIntake.findMany({
        where: {
          scheduledAt: { gte: now, lte: in5Min },
          takenAt: null,
          skipped: false,
        },
        include: {
          medication: {
            include: {
              patient: { include: { user: true } },
            },
          },
        },
        take: 50,
      })

      for (const intake of upcomingIntakes) {
        const user = intake.medication.patient.user
        const medName = intake.medication.name

        await NotificationService.send({
          userId: user.id,
          title: '💊 Rappel médicament',
          body: `Il est temps de prendre ${medName} (${intake.medication.dosage})`,
          type: 'MEDICATION_REMINDER',
          data: { medicationId: intake.medicationId, intakeId: intake.id },
        })

        const hour = now.getHours()
        if (hour === 7 || hour === 20) {
          await SmsService.sendMedicationReminder(user.phone, medName)
        }
      }

      if (upcomingIntakes.length > 0) {
        logger.info(`Sent ${upcomingIntakes.length} medication reminders`)
      }
    } catch (error) {
      logger.error('Medication reminder job error:', error)
    }
  })

  logger.info('✅ Medication reminders cron job started')
}
