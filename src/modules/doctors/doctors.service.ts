import { prisma } from '../../config/database'
import type {
  GetDoctorsQuery,
  UpdateDoctorProfileInput,
  SetAvailabilityInput,
  UpdateOnlineStatusInput,
} from './doctors.schema'

export class DoctorsService {
  static async getDoctors(query: GetDoctorsQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.country) {
      where.country = query.country
    }

    if (query.specialty) {
      where.specialty = { contains: query.specialty, mode: 'insensitive' }
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' }
    }

    if (query.isOnline !== undefined) {
      where.isOnline = query.isOnline === 'true'
    }

    if (query.acceptsNHIS !== undefined) {
      where.acceptsNHIS = query.acceptsNHIS === 'true'
    }

    if (query.minRating) {
      where.rating = { gte: query.minRating }
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isOnline: 'desc' }, { rating: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.doctor.count({ where }),
    ])

    return {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getDoctor(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        availabilities: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })

    if (!doctor) {
      throw new Error('Médecin introuvable')
    }

    return doctor
  }

  static async getDoctorProfile(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        availabilities: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    return doctor
  }

  static async updateDoctorProfile(userId: string, data: UpdateDoctorProfileInput) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    const updateData: any = {}

    if (data.specialty) updateData.specialty = data.specialty
    if (data.hospital) updateData.hospital = data.hospital
    if (data.city) updateData.city = data.city
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.consultationFee) updateData.consultationFee = data.consultationFee
    if (data.currency) updateData.currency = data.currency
    if (data.acceptsNHIS !== undefined) updateData.acceptsNHIS = data.acceptsNHIS
    if (data.languages) updateData.languages = data.languages
    if (data.yearsExperience !== undefined) updateData.yearsExperience = data.yearsExperience

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return updatedDoctor
  }

  static async updateOnlineStatus(userId: string, data: UpdateOnlineStatusInput) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: { isOnline: data.isOnline },
      select: {
        id: true,
        isOnline: true,
      },
    })

    return updatedDoctor
  }

  static async setAvailability(userId: string, data: SetAvailabilityInput) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })

    return availability
  }

  static async getAvailabilities(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.id, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    })

    return availabilities
  }

  static async deleteAvailability(userId: string, availabilityId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!doctor) {
      throw new Error('Profil médecin introuvable')
    }

    const availability = await prisma.doctorAvailability.findFirst({
      where: {
        id: availabilityId,
        doctorId: doctor.id,
      },
    })

    if (!availability) {
      throw new Error('Disponibilité introuvable')
    }

    await prisma.doctorAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false },
    })

    return { message: 'Disponibilité supprimée avec succès' }
  }
}
