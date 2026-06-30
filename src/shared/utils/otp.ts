import { env } from '../../config/env'

export class OtpHelper {
  static generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static getExpiryDate(): Date {
    const now = new Date()
    now.setMinutes(now.getMinutes() + env.OTP_EXPIRY_MINUTES)
    return now
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate
  }
}
