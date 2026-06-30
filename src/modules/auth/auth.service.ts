import { prisma } from '../../config/database'
import { HashHelper } from '../../shared/utils/hash'
import { OtpHelper } from '../../shared/utils/otp'
import { JwtHelper, JwtPayload } from '../../shared/utils/jwt'
import { EmailService } from '../../shared/services/email.service'
import { SmsService } from '../../shared/services/sms.service'
import { CacheService } from '../../shared/services/cache.service'
import { env } from '../../config/env'

export interface RegisterData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACIST'
  country: 'GH' | 'GN'
  city?: string
  dateOfBirth?: string
  bloodGroup?: string
  specialty?: string
  licenseNumber?: string
  hospital?: string
}

export class AuthService {
  static async register(data: RegisterData) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    })

    if (existingUser) {
      throw new Error('Email ou téléphone déjà utilisé')
    }

    const passwordHash = await HashHelper.hash(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        country: data.country,
        city: data.city,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        bloodGroup: data.bloodGroup as any,
      },
    })

    if (data.role === 'PATIENT') {
      await prisma.patient.create({
        data: { userId: user.id },
      })
    } else if (data.role === 'DOCTOR' && data.specialty && data.licenseNumber && data.hospital) {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialty: data.specialty,
          licenseNumber: data.licenseNumber,
          hospital: data.hospital,
          city: data.city || '',
          country: data.country,
          consultationFee: 0,
          currency: data.country === 'GH' ? 'GHS' : 'GNF',
        },
      })
    }

    const emailOtp = OtpHelper.generate()
    const phoneOtp = OtpHelper.generate()
    const expiryDate = OtpHelper.getExpiryDate()

    await prisma.otpCode.createMany({
      data: [
        {
          userId: user.id,
          code: emailOtp,
          type: 'EMAIL_VERIFY',
          expiresAt: expiryDate,
        },
        {
          userId: user.id,
          code: phoneOtp,
          type: 'PHONE_VERIFY',
          expiresAt: expiryDate,
        },
      ],
    })

    await Promise.all([
      EmailService.sendVerificationEmail(user.email, emailOtp),
      SmsService.sendOtp(user.phone, phoneOtp),
    ])

    return {
      userId: user.id,
      message: 'Inscription réussie. Vérifiez votre email et téléphone.',
    }
  }

  static async login(email: string, password: string) {
    const failKey = CacheService.buildKey('login_fail', email)
    const attempts = (await CacheService.get<number>(failKey)) || 0

    if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
      const ttl = await CacheService.ttl(failKey)
      throw new Error(`Trop de tentatives. Réessayez dans ${Math.ceil(ttl / 60)} minutes`)
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true, patientProfile: true },
    })

    if (!user) {
      await CacheService.incr(failKey)
      await CacheService.expire(failKey, env.LOCKOUT_MINUTES * 60)
      throw new Error('Email ou mot de passe incorrect')
    }

    const validPassword = await HashHelper.compare(password, user.passwordHash)

    if (!validPassword) {
      await CacheService.incr(failKey)
      await CacheService.expire(failKey, env.LOCKOUT_MINUTES * 60)
      throw new Error('Email ou mot de passe incorrect')
    }

    if (!user.isEmailVerified) {
      throw new Error('Veuillez vérifier votre email avant de vous connecter')
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      country: user.country,
      email: user.email,
    }

    const accessToken = JwtHelper.generateAccessToken(payload)
    const refreshToken = JwtHelper.generateRefreshToken(payload)

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: expiryDate,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    await CacheService.del(failKey)

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country,
      },
    }
  }

  static async refresh(refreshToken: string) {
    const payload = JwtHelper.verifyRefreshToken(refreshToken)

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Refresh token invalide ou expiré')
    }

    await prisma.refreshToken.delete({ where: { id: tokenRecord.id } })

    const newPayload: JwtPayload = {
      sub: payload.sub,
      role: payload.role,
      country: payload.country,
      email: payload.email,
    }

    const accessToken = JwtHelper.generateAccessToken(newPayload)
    const newRefreshToken = JwtHelper.generateRefreshToken(newPayload)

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 7)

    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        token: newRefreshToken,
        expiresAt: expiryDate,
      },
    })

    return { accessToken, refreshToken: newRefreshToken }
  }

  static async logout(accessToken: string, refreshToken: string) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {})

    const payload = JwtHelper.decodeToken(accessToken)
    if (payload) {
      const exp = (payload as any).exp
      const now = Math.floor(Date.now() / 1000)
      const ttl = exp - now

      if (ttl > 0) {
        await CacheService.set(`blacklist:${accessToken}`, '1', ttl)
      }
    }

    return { message: 'Déconnexion réussie' }
  }

  static async verifyOtp(userId: string, code: string, type: string) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type,
        usedAt: null,
      },
    })

    if (!otpRecord) {
      throw new Error('Code OTP invalide')
    }

    if (OtpHelper.isExpired(otpRecord.expiresAt)) {
      throw new Error('Code OTP expiré')
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    })

    if (type === 'EMAIL_VERIFY') {
      await prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      })
    } else if (type === 'PHONE_VERIFY') {
      await prisma.user.update({
        where: { id: userId },
        data: { isPhoneVerified: true },
      })
    }

    return { message: 'Vérification réussie' }
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return { message: 'Si cet email existe, un code de réinitialisation a été envoyé' }
    }

    const code = OtpHelper.generate()
    const expiryDate = OtpHelper.getExpiryDate()

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        expiresAt: expiryDate,
      },
    })

    await EmailService.sendPasswordResetEmail(email, code)

    return { message: 'Si cet email existe, un code de réinitialisation a été envoyé' }
  }

  static async resetPassword(email: string, code: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new Error('Code invalide')
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        usedAt: null,
      },
    })

    if (!otpRecord || OtpHelper.isExpired(otpRecord.expiresAt)) {
      throw new Error('Code invalide ou expiré')
    }

    const passwordHash = await HashHelper.hash(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    })

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

    return { message: 'Mot de passe réinitialisé avec succès' }
  }

  static async resendOtp(userId: string, type: 'EMAIL_VERIFY' | 'PHONE_VERIFY') {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    const code = OtpHelper.generate()
    const expiryDate = OtpHelper.getExpiryDate()

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        type,
        expiresAt: expiryDate,
      },
    })

    if (type === 'EMAIL_VERIFY') {
      await EmailService.sendVerificationEmail(user.email, code)
    } else {
      await SmsService.sendOtp(user.phone, code)
    }

    return { message: 'Code renvoyé avec succès' }
  }
}