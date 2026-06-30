import { Resend } from 'resend'
import { env } from '../../config/env'
import { logger } from '../../config/logger'

const resend = new Resend(env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  static async send({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      })

      if (error) {
        logger.error('Email sending failed:', error)
        return false
      }

      logger.info(`Email sent successfully to ${to}:`, data)
      return true
    } catch (error) {
      logger.error('Email service error:', error)
      return false
    }
  }

  static async sendVerificationEmail(to: string, code: string): Promise<boolean> {
    return await this.send({
      to,
      subject: 'Vérifiez votre email - MaSanteYa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur MaSanteYa!</h2>
          <p>Votre code de vérification est :</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 8px;">${code}</h1>
          </div>
          <p>Ce code expire dans ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        </div>
      `,
      text: `Votre code de vérification MaSanteYa est : ${code}. Ce code expire dans ${env.OTP_EXPIRY_MINUTES} minutes.`,
    })
  }

  static async sendPasswordResetEmail(to: string, code: string): Promise<boolean> {
    return await this.send({
      to,
      subject: 'Réinitialisation de mot de passe - MaSanteYa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
          <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous :</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; margin: 0; font-size: 32px; letter-spacing: 8px;">${code}</h1>
          </div>
          <p>Ce code expire dans ${env.OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="color: #dc2626; font-weight: bold;">Si vous n'avez pas demandé cette réinitialisation, contactez-nous immédiatement.</p>
        </div>
      `,
      text: `Votre code de réinitialisation MaSanteYa est : ${code}. Ce code expire dans ${env.OTP_EXPIRY_MINUTES} minutes.`,
    })
  }

  static async sendConsultationConfirmation(
    to: string,
    doctorName: string,
    scheduledAt: Date
  ): Promise<boolean> {
    return await this.send({
      to,
      subject: 'Consultation confirmée - MaSanteYa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Consultation confirmée</h2>
          <p>Votre consultation avec <strong>Dr. ${doctorName}</strong> a été confirmée.</p>
          <p><strong>Date et heure :</strong> ${scheduledAt.toLocaleString('fr-FR')}</p>
          <p>Vous recevrez une notification avant le début de votre consultation.</p>
        </div>
      `,
    })
  }
}
