import { prisma } from '../../config/database'
import { StorageService } from '../../shared/services/storage.service'
import type { UpdateProfileInput } from './users.schema'

export class UsersService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        bloodGroup: true,
        country: true,
        city: true,
        avatarUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        patientProfile: {
          select: {
            id: true,
            emergencyName: true,
            emergencyPhone: true,
          },
        },
        doctorProfile: {
          select: {
            id: true,
            specialty: true,
            licenseNumber: true,
            hospital: true,
            city: true,
            bio: true,
            consultationFee: true,
            currency: true,
            yearsExperience: true,
            isOnline: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    return user
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    const updateData: any = {}

    if (data.firstName) updateData.firstName = data.firstName
    if (data.lastName) updateData.lastName = data.lastName
    if (data.city) updateData.city = data.city
    if (data.phone) updateData.phone = data.phone
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth)
    if (data.bloodGroup) updateData.bloodGroup = data.bloodGroup

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        bloodGroup: true,
        country: true,
        city: true,
        avatarUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        updatedAt: true,
      },
    })

    return user
  }

  static async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await StorageService.upload({
      folder: `avatars`,
      fileName: `${userId}_${file.originalname}`,
      file: file.buffer,
      contentType: file.mimetype,
    })

    if (!result) {
      throw new Error('Erreur lors de l\'upload de l\'avatar')
    }

    const avatarUrl = result.url

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    })

    return user
  }

  static async deleteAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    })

    await prisma.refreshToken.deleteMany({
      where: { userId },
    })

    return { message: 'Compte supprimé avec succès' }
  }

  static async getStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    if (user.role === 'PATIENT') {
      const [consultationsCount, vitalsCount, recordsCount, medicationsCount] = await Promise.all([
        prisma.consultation.count({ where: { patientId: userId } }),
        prisma.vitalSign.count({ where: { patientId: userId } }),
        prisma.medicalRecord.count({ where: { patientId: userId } }),
        prisma.medication.count({ where: { patientId: userId, isActive: true } }),
      ])

      return {
        consultations: consultationsCount,
        vitals: vitalsCount,
        records: recordsCount,
        activeMedications: medicationsCount,
      }
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
        select: { id: true },
      })

      if (!doctor) {
        throw new Error('Profil médecin introuvable')
      }

      const [consultationsCount, patientsCount] = await Promise.all([
        prisma.consultation.count({ where: { doctorId: doctor.id } }),
        prisma.consultation.groupBy({
          by: ['patientId'],
          where: { doctorId: doctor.id },
        }),
      ])

      return {
        consultations: consultationsCount,
        patients: patientsCount.length,
      }
    }

    return {}
  }
}
