import { prisma } from '../../config/database'
import { nanoid } from 'nanoid'
import type {
  CreateConsultationInput,
  UpdateConsultationInput,
  UpdateStatusInput,
  GetConsultationsQuery,
  SendMessageInput,
  CreateReviewInput,
} from './consultations.schema'

export class ConsultationsService {
  static async createConsultation(patientId: string, data: CreateConsultationInput) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: true },
    })

    if (!doctor) {
      throw new Error('Médecin introuvable')
    }

    const scheduledAt = new Date(data.scheduledAt)
    const now = new Date()

    if (scheduledAt <= now) {
      throw new Error('La date de consultation doit être dans le futur')
    }

    const roomId = nanoid(10)

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        scheduledAt,
        notes: data.notes,
        fee: doctor.consultationFee,
        currency: doctor.currency,
        roomId,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    return consultation
  }

  static async getConsultations(userId: string, role: string, query: GetConsultationsQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (role === 'PATIENT' || query.role === 'patient') {
      where.patientId = userId
    } else if (role === 'DOCTOR' || query.role === 'doctor') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
        select: { id: true },
      })

      if (!doctor) {
        throw new Error('Profil médecin introuvable')
      }

      where.doctorId = doctor.id
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.startDate || query.endDate) {
      where.scheduledAt = {}
      if (query.startDate) where.scheduledAt.gte = new Date(query.startDate)
      if (query.endDate) where.scheduledAt.lte = new Date(query.endDate)
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          review: true,
        },
      }),
      prisma.consultation.count({ where }),
    ])

    return {
      consultations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getConsultation(userId: string, consultationId: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        review: true,
      },
    })

    if (!consultation) {
      throw new Error('Consultation introuvable')
    }

    if (consultation.patientId !== userId && consultation.doctor.userId !== userId) {
      throw new Error('Accès non autorisé')
    }

    return consultation
  }

  static async updateConsultation(userId: string, consultationId: string, data: UpdateConsultationInput) {
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    })

    if (!existing) {
      throw new Error('Consultation introuvable')
    }

    if (existing.patientId !== userId && existing.doctor.userId !== userId) {
      throw new Error('Accès non autorisé')
    }

    const updateData: any = {}

    if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt)
    if (data.notes) updateData.notes = data.notes
    if (data.diagnosis) updateData.diagnosis = data.diagnosis
    if (data.prescription) updateData.prescription = data.prescription

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: updateData,
    })

    return consultation
  }

  static async updateStatus(userId: string, consultationId: string, data: UpdateStatusInput) {
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    })

    if (!existing) {
      throw new Error('Consultation introuvable')
    }

    if (existing.doctor.userId !== userId) {
      throw new Error('Seul le médecin peut changer le statut')
    }

    const updateData: any = { status: data.status }

    if (data.status === 'IN_PROGRESS' && !existing.startedAt) {
      updateData.startedAt = new Date()
    }

    if (data.status === 'COMPLETED' && !existing.endedAt) {
      updateData.endedAt = new Date()
      if (existing.startedAt) {
        const duration = Math.floor(
          (new Date().getTime() - existing.startedAt.getTime()) / 60000
        )
        updateData.durationMin = duration
      }
    }

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: updateData,
    })

    return consultation
  }

  static async cancelConsultation(userId: string, consultationId: string) {
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    })

    if (!existing) {
      throw new Error('Consultation introuvable')
    }

    if (existing.patientId !== userId) {
      throw new Error('Seul le patient peut annuler')
    }

    if (existing.status !== 'SCHEDULED') {
      throw new Error('Seules les consultations planifiées peuvent être annulées')
    }

    const consultation = await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'CANCELLED' },
    })

    return consultation
  }

  static async sendMessage(userId: string, consultationId: string, data: SendMessageInput, file?: Express.Multer.File) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    })

    if (!consultation) {
      throw new Error('Consultation introuvable')
    }

    if (consultation.patientId !== userId && consultation.doctor.userId !== userId) {
      throw new Error('Accès non autorisé')
    }

    let fileUrl: string | undefined

    if (file) {
      const StorageService = (await import('../../shared/services/storage.service')).StorageService
      const result = await StorageService.upload({
        folder: `consultations/${consultationId}`,
        fileName: file.originalname,
        file: file.buffer,
        contentType: file.mimetype,
      })

      if (result) {
        fileUrl = result.url
      }
    }

    const message = await prisma.message.create({
      data: {
        consultationId,
        senderId: userId,
        content: data.content,
        type: data.type || 'TEXT',
        fileUrl,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return message
  }

  static async getMessages(userId: string, consultationId: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { doctor: true },
    })

    if (!consultation) {
      throw new Error('Consultation introuvable')
    }

    if (consultation.patientId !== userId && consultation.doctor.userId !== userId) {
      throw new Error('Accès non autorisé')
    }

    const messages = await prisma.message.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return messages
  }

  static async createReview(userId: string, consultationId: string, data: CreateReviewInput) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { review: true, doctor: true },
    })

    if (!consultation) {
      throw new Error('Consultation introuvable')
    }

    if (consultation.patientId !== userId) {
      throw new Error('Seul le patient peut laisser un avis')
    }

    if (consultation.status !== 'COMPLETED') {
      throw new Error('La consultation doit être terminée')
    }

    if (consultation.review) {
      throw new Error('Avis déjà laissé')
    }

    const review = await prisma.consultationReview.create({
      data: {
        consultationId,
        rating: data.rating,
        comment: data.comment,
      },
    })

    const reviews = await prisma.consultationReview.findMany({
      where: {
        consultation: {
          doctorId: consultation.doctorId,
        },
      },
    })

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

    await prisma.doctor.update({
      where: { id: consultation.doctorId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    })

    return review
  }
}
