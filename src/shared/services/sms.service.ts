import AfricasTalking from 'africastalking'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

const africasTalking = AfricasTalking({
  apiKey: env.AT_API_KEY,
  username: env.AT_USERNAME,
})

const sms = africasTalking.SMS

export interface SendSmsParams {
  to: string
  message: string
}

export class SmsService {
  static async send({ to, message }: SendSmsParams): Promise<boolean> {
    try {
      if (env.AT_ENVIRONMENT === 'sandbox') {
        logger.info(`[SANDBOX] SMS to ${to}: ${message}`)
        return true
      }

      const result = await sms.send({
        to: [to],
        message,
        from: 'MaSanteYa',
      })

      logger.info('SMS sent successfully:', result)
      return result.SMSMessageData.Recipients[0].status === 'Success'
    } catch (error) {
      logger.error('SMS service error:', error)
      return false
    }
  }

  static async sendOtp(to: string, code: string): Promise<boolean> {
    return await this.send({
      to,
      message: `Votre code de vérification MaSanteYa est : ${code}. Valide ${env.OTP_EXPIRY_MINUTES} min.`,
    })
  }

  static async sendMedicationReminder(to: string, medicationName: string): Promise<boolean> {
    return await this.send({
      to,
      message: `MaSanteYa: Il est temps de prendre ${medicationName}.`,
    })
  }

  static async sendConsultationReminder(to: string, doctorName: string, time: string): Promise<boolean> {
    return await this.send({
      to,
      message: `MaSanteYa: Rappel - Consultation avec Dr. ${doctorName} à ${time}.`,
    })
  }
}
