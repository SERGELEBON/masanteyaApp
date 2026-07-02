import { z } from 'zod'

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        pharmacyId: z.string().cuid(),
        medicationName: z.string().min(2),
        quantity: z.number().int().positive(),
      })
    ).min(1),
    deliveryAddress: z.string().min(5),
    deliveryLat: z.number().optional(),
    deliveryLng: z.number().optional(),
    isPaidByNHIS: z.boolean().optional(),
    notes: z.string().optional(),
  }),
})

export const updateOrderSchema = z.object({
  body: z.object({
    deliveryAddress: z.string().min(5).optional(),
    deliveryLat: z.number().optional(),
    deliveryLng: z.number().optional(),
    notes: z.string().optional(),
  }),
})

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']),
    courierName: z.string().optional(),
    courierPhone: z.string().optional(),
    estimatedMinutes: z.number().int().positive().optional(),
  }),
})

export const updateCourierLocationSchema = z.object({
  body: z.object({
    courierLat: z.number(),
    courierLng: z.number(),
  }),
})

export const getOrdersQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body']
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>['body']
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>['body']
export type UpdateCourierLocationInput = z.infer<typeof updateCourierLocationSchema>['body']
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>['query']