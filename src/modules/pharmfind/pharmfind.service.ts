import { prisma } from '../../config/database'
import type { SearchPharmaciesQuery, SearchMedicationQuery } from './pharmfind.schema'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export class PharmFindService {
  static async searchPharmacies(query: SearchPharmaciesQuery) {
    const radius = query.radius || 10
    const limit = query.limit || 50

    const where: any = {}

    if (query.country) {
      where.country = query.country
    }

    if (query.isOpen !== undefined) {
      where.isOpen = query.isOpen === 'true'
    }

    if (query.isOnDuty !== undefined) {
      where.isOnDuty = query.isOnDuty === 'true'
    }

    if (query.acceptsNHIS !== undefined) {
      where.acceptsNHIS = query.acceptsNHIS === 'true'
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where,
      include: {
        stock: {
          where: { available: true },
          take: 5,
        },
      },
    })

    const pharmaciesWithDistance = pharmacies.map((pharmacy) => {
      const distance = haversineDistance(
        query.latitude,
        query.longitude,
        Number(pharmacy.latitude),
        Number(pharmacy.longitude)
      )

      return {
        ...pharmacy,
        distance: Math.round(distance * 100) / 100,
      }
    })

    const filtered = pharmaciesWithDistance.filter((p) => p.distance <= radius)

    const sorted = filtered.sort((a, b) => a.distance - b.distance)

    return sorted.slice(0, limit)
  }

  static async searchMedication(query: SearchMedicationQuery) {
    const radius = query.radius || 10
    const limit = query.limit || 50

    const where: any = {
      medicationName: {
        contains: query.medication,
        mode: 'insensitive' as const,
      },
      available: true,
    }

    const stocks = await prisma.pharmacyStock.findMany({
      where,
      include: {
        pharmacy: true,
      },
    })

    if (!query.latitude || !query.longitude) {
      return stocks
        .map((stock) => ({
          ...stock,
          distance: null,
        }))
        .slice(0, limit)
    }

    const stocksWithDistance = stocks.map((stock) => {
      const distance = haversineDistance(
        query.latitude!,
        query.longitude!,
        Number(stock.pharmacy.latitude),
        Number(stock.pharmacy.longitude)
      )

      return {
        ...stock,
        distance: Math.round(distance * 100) / 100,
      }
    })

    const filtered = stocksWithDistance.filter((s) => s.distance <= radius)

    const sorted = filtered.sort((a, b) => a.distance - b.distance)

    return sorted.slice(0, limit)
  }

  static async getPharmacy(pharmacyId: string) {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
      include: {
        stock: {
          where: { available: true },
          orderBy: { medicationName: 'asc' },
        },
      },
    })

    if (!pharmacy) {
      throw new Error('Pharmacie introuvable')
    }

    return pharmacy
  }

  static async getPharmacyStock(pharmacyId: string, medicationName?: string) {
    const where: any = {
      pharmacyId,
      available: true,
    }

    if (medicationName) {
      where.medicationName = {
        contains: medicationName,
        mode: 'insensitive' as const,
      }
    }

    const stock = await prisma.pharmacyStock.findMany({
      where,
      include: {
        pharmacy: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
      },
      orderBy: { medicationName: 'asc' },
    })

    return stock
  }

  static async getNearbyOnDutyPharmacies(latitude: number, longitude: number) {
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        isOnDuty: true,
        isOpen: true,
      },
    })

    const pharmaciesWithDistance = pharmacies.map((pharmacy) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        Number(pharmacy.latitude),
        Number(pharmacy.longitude)
      )

      return {
        ...pharmacy,
        distance: Math.round(distance * 100) / 100,
      }
    })

    const sorted = pharmaciesWithDistance.sort((a, b) => a.distance - b.distance)

    return sorted.slice(0, 10)
  }
}