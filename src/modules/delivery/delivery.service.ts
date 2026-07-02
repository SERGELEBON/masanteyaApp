import { prisma } from '../../config/database'
import type {
  CreateOrderInput,
  UpdateOrderInput,
  UpdateStatusInput,
  UpdateCourierLocationInput,
  GetOrdersQuery,
} from './delivery.schema'

export class DeliveryService {
  static async createOrder(patientId: string, data: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      const itemsWithPrices = await Promise.all(
        data.items.map(async (item) => {
          const stock = await tx.pharmacyStock.findFirst({
            where: {
              pharmacyId: item.pharmacyId,
              medicationName: item.medicationName,
              quantity: { gt: 0 },
            },
            include: {
              pharmacy: true,
            },
          })

          if (!stock) {
            throw new Error(`Médicament ${item.medicationName} non disponible`)
          }

          if (stock.quantity < item.quantity) {
            throw new Error(`Stock insuffisant pour ${item.medicationName}`)
          }

          return {
            pharmacyId: item.pharmacyId,
            medicationName: item.medicationName,
            quantity: item.quantity,
            unitPrice: stock.price,
            currency: stock.currency,
          }
        })
      )

      const totalAmount = itemsWithPrices.reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0
      )

      const currency = itemsWithPrices[0]?.currency || 'GHS'

      const order = await tx.order.create({
        data: {
          patientId,
          totalAmount,
          currency,
          deliveryAddress: data.deliveryAddress,
          deliveryLat: data.deliveryLat,
          deliveryLng: data.deliveryLng,
          isPaidByNHIS: data.isPaidByNHIS || false,
          notes: data.notes,
          items: {
            create: itemsWithPrices,
          },
        },
        include: {
          items: {
            include: {
              pharmacy: true,
            },
          },
        },
      })

      for (const item of data.items) {
        await tx.pharmacyStock.updateMany({
          where: {
            pharmacyId: item.pharmacyId,
            medicationName: item.medicationName,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      }

      return order
    })
  }

  static async getOrders(patientId: string, query: GetOrdersQuery) {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = { patientId }

    if (query.status) {
      where.status = query.status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              pharmacy: {
                select: {
                  name: true,
                  address: true,
                  phone: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getOrder(patientId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        patientId,
      },
      include: {
        items: {
          include: {
            pharmacy: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error('Commande introuvable')
    }

    return order
  }

  static async updateOrder(patientId: string, orderId: string, data: UpdateOrderInput) {
    const existing = await prisma.order.findFirst({
      where: { id: orderId, patientId },
    })

    if (!existing) {
      throw new Error('Commande introuvable')
    }

    if (existing.status !== 'PENDING') {
      throw new Error('Seules les commandes en attente peuvent être modifiées')
    }

    const updateData: any = {}

    if (data.deliveryAddress) updateData.deliveryAddress = data.deliveryAddress
    if (data.deliveryLat !== undefined) updateData.deliveryLat = data.deliveryLat
    if (data.deliveryLng !== undefined) updateData.deliveryLng = data.deliveryLng
    if (data.notes !== undefined) updateData.notes = data.notes

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return order
  }

  static async updateStatus(orderId: string, data: UpdateStatusInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Commande introuvable')
    }

    const updateData: any = { status: data.status }

    if (data.courierName) updateData.courierName = data.courierName
    if (data.courierPhone) updateData.courierPhone = data.courierPhone
    if (data.estimatedMinutes) updateData.estimatedMinutes = data.estimatedMinutes

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return updated
  }

  static async updateCourierLocation(orderId: string, data: UpdateCourierLocationInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new Error('Commande introuvable')
    }

    if (order.status !== 'DISPATCHED') {
      throw new Error('La commande doit être expédiée pour suivre le livreur')
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        courierLat: data.courierLat,
        courierLng: data.courierLng,
      },
    })

    return updated
  }

  static async cancelOrder(patientId: string, orderId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, patientId },
        include: { items: true },
      })

      if (!order) {
        throw new Error('Commande introuvable')
      }

      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw new Error('Cette commande ne peut plus être annulée')
      }

      for (const item of order.items) {
        await tx.pharmacyStock.updateMany({
          where: {
            pharmacyId: item.pharmacyId,
            medicationName: item.medicationName,
          },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        })
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })

      return updated
    })
  }
}