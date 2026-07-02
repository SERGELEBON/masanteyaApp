import { prisma } from '../../config/database'
import type {
  CreateMedicationInput,
  UpdateMedicationInput,
  GetMedicationsQuery,
  RecordIntakeInput,
} from './medications.schema'

export class MedicationsService {
  static async createMedication(patientId: string, data: CreateMedicationInput) {
    const startDate = new Date(data.startDate)
    const endDate = data.endDate ? new Date(data.endDate) : null
    const refillDate = data.refillDate ? new Date(data.refillDate) : null

    if (endDate && endDate <= startDate) {
      throw new Error('La date de fin doit être après la date de début')
    }

    if (refillDate && refillDate <= startDate) {
      throw new Error('La date de renouvellement doit être après la date de début')
    }

    if (data.stockRemaining !== undefined && data.stockRemaining < 0) {
      throw new Error('Le stock restant ne peut pas être négatif')
    }

    const medication = await prisma.medication.create({
      data: {
        patientId,
        name: data.name,
        dosage: data.dosage,
        form: data.form,
        frequency: data.frequency,
        times: data.times,
        startDate,
        endDate,
        refillDate,
        stockRemaining: data.stockRemaining || 0,
        prescribedBy: data.prescribedBy,
      },
    })

    return medication
  }

  static async getMedications(patientId: string, query: GetMedicationsQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = { patientId }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true'
    }

    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          intakes: {
            where: {
              scheduledAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
          },
        },
      }),
      prisma.medication.count({ where }),
    ])

    return {
      medications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getMedication(patientId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        patientId,
      },
      include: {
        intakes: {
          orderBy: { scheduledAt: 'desc' },
          take: 30,
        },
      },
    })

    if (!medication) {
      throw new Error('Médicament introuvable')
    }

    return medication
  }

  static async updateMedication(patientId: string, medicationId: string, data: UpdateMedicationInput) {
    const existing = await prisma.medication.findFirst({
      where: { id: medicationId, patientId },
    })

    if (!existing) {
      throw new Error('Médicament introuvable')
    }

    const updateData: any = {}

    if (data.dosage) updateData.dosage = data.dosage
    if (data.frequency) updateData.frequency = data.frequency
    if (data.times) updateData.times = data.times
    if (data.endDate) {
      const endDate = new Date(data.endDate)
      if (endDate <= existing.startDate) {
        throw new Error('La date de fin doit être après la date de début')
      }
      updateData.endDate = endDate
    }
    if (data.refillDate) {
      const refillDate = new Date(data.refillDate)
      if (refillDate <= existing.startDate) {
        throw new Error('La date de renouvellement doit être après la date de début')
      }
      updateData.refillDate = refillDate
    }
    if (data.stockRemaining !== undefined) {
      if (data.stockRemaining < 0) {
        throw new Error('Le stock restant ne peut pas être négatif')
      }
      updateData.stockRemaining = data.stockRemaining
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const medication = await prisma.medication.update({
      where: { id: medicationId },
      data: updateData,
    })

    return medication
  }

  static async deleteMedication(patientId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, patientId },
    })

    if (!medication) {
      throw new Error('Médicament introuvable')
    }

    await prisma.medication.delete({
      where: { id: medicationId },
    })

    return { message: 'Médicament supprimé avec succès' }
  }

  static async recordIntake(patientId: string, medicationId: string, data: RecordIntakeInput) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, patientId },
    })

    if (!medication) {
      throw new Error('Médicament introuvable')
    }

    const today = new Date()
    const [hours, minutes] = data.scheduledTime.split(':')
    const scheduledAt = new Date(today.setHours(parseInt(hours), parseInt(minutes), 0, 0))

    const intake = await prisma.medicationIntake.create({
      data: {
        medicationId,
        scheduledAt,
        takenAt: data.takenAt ? new Date(data.takenAt) : new Date(),
        note: data.notes,
      },
    })

    return intake
  }

  static async getIntakeHistory(patientId: string, medicationId: string) {
    const medication = await prisma.medication.findFirst({
      where: { id: medicationId, patientId },
    })

    if (!medication) {
      throw new Error('Médicament introuvable')
    }

    const intakes = await prisma.medicationIntake.findMany({
      where: { medicationId },
      orderBy: { scheduledAt: 'desc' },
      take: 100,
    })

    return intakes
  }

  static async getTodaySchedule(patientId: string) {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const medications = await prisma.medication.findMany({
      where: {
        patientId,
        isActive: true,
      },
      include: {
        intakes: {
          where: {
            scheduledAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        },
      },
    })

    const schedule = medications.map((med) => {
      const timesToday = med.times.map((time) => {
        const [hours, minutes] = time.split(':')
        const scheduledAt = new Date(today.setHours(parseInt(hours), parseInt(minutes), 0, 0))

        const intake = med.intakes.find(
          (i) => i.scheduledAt.getTime() === scheduledAt.getTime()
        )

        return {
          time,
          scheduledAt,
          taken: !!intake?.takenAt,
          takenAt: intake?.takenAt,
          skipped: intake?.skipped || false,
        }
      })

      return {
        medication: {
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          form: med.form,
        },
        schedule: timesToday,
      }
    })

    return schedule
  }
}
