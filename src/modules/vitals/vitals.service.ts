import { prisma } from '../../config/database'
import type { CreateVitalInput, GetVitalsQuery } from './vitals.schema'

interface VitalValue {
  systolic?: number
  diastolic?: number
  value?: number
}

export class VitalsService {
  static async createVital(patientId: string, data: CreateVitalInput) {
    const valueJson = data.valueJson as VitalValue
    let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL'

    switch (data.type) {
      case 'HEART_RATE':
        if (valueJson.value) {
          if (valueJson.value < 60 || valueJson.value > 100) status = 'WARNING'
          if (valueJson.value < 40 || valueJson.value > 130) status = 'CRITICAL'
        }
        break
      case 'BLOOD_PRESSURE':
        if (valueJson.systolic && valueJson.diastolic) {
          if (valueJson.systolic > 130 || valueJson.diastolic > 85) status = 'WARNING'
          if (valueJson.systolic > 180 || valueJson.diastolic > 110) status = 'CRITICAL'
        }
        break
      case 'GLUCOSE':
        if (valueJson.value) {
          if (valueJson.value < 70 || valueJson.value > 140) status = 'WARNING'
          if (valueJson.value < 50 || valueJson.value > 200) status = 'CRITICAL'
        }
        break
      case 'SPO2':
        if (valueJson.value) {
          if (valueJson.value < 95) status = 'WARNING'
          if (valueJson.value < 90) status = 'CRITICAL'
        }
        break
      case 'TEMPERATURE':
        if (valueJson.value) {
          if (valueJson.value < 36 || valueJson.value > 37.5) status = 'WARNING'
          if (valueJson.value < 35 || valueJson.value > 39) status = 'CRITICAL'
        }
        break
    }

    const vital = await prisma.vitalSign.create({
      data: {
        patientId,
        type: data.type,
        valueJson: data.valueJson,
        unit: data.unit,
        status,
        deviceId: data.deviceId,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : new Date(),
      },
    })

    return vital
  }

  static async getVitals(patientId: string, query: GetVitalsQuery) {
    const where: any = { patientId }

    if (query.type) {
      where.type = query.type
    }

    if (query.startDate || query.endDate) {
      where.measuredAt = {}
      if (query.startDate) where.measuredAt.gte = new Date(query.startDate)
      if (query.endDate) where.measuredAt.lte = new Date(query.endDate)
    }

    const vitals = await prisma.vitalSign.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
      take: query.limit || 50,
    })

    return vitals
  }

  static async getVital(patientId: string, vitalId: string) {
    const vital = await prisma.vitalSign.findFirst({
      where: {
        id: vitalId,
        patientId,
      },
    })

    if (!vital) {
      throw new Error('Signe vital introuvable')
    }

    return vital
  }

  static async deleteVital(patientId: string, vitalId: string) {
    const vital = await prisma.vitalSign.findFirst({
      where: {
        id: vitalId,
        patientId,
      },
    })

    if (!vital) {
      throw new Error('Signe vital introuvable')
    }

    await prisma.vitalSign.delete({
      where: { id: vitalId },
    })

    return { message: 'Signe vital supprimé avec succès' }
  }

  static async getVitalStats(patientId: string) {
    const vitals = await prisma.vitalSign.findMany({
      where: { patientId },
      orderBy: { measuredAt: 'desc' },
      take: 100,
    })

    const stats: Record<string, any> = {}

    const types = ['HEART_RATE', 'BLOOD_PRESSURE', 'GLUCOSE', 'SPO2', 'TEMPERATURE', 'WEIGHT']

    for (const type of types) {
      const typeVitals = vitals.filter((v) => v.type === type)

      if (typeVitals.length > 0) {
        const latest = typeVitals[0]
        const count = typeVitals.length
        const criticalCount = typeVitals.filter((v) => v.status === 'CRITICAL').length
        const warningCount = typeVitals.filter((v) => v.status === 'WARNING').length

        stats[type] = {
          latest: latest.valueJson,
          latestAt: latest.measuredAt,
          count,
          criticalCount,
          warningCount,
          status: latest.status,
        }
      }
    }

    return stats
  }
}