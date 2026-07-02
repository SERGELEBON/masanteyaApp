import { z } from 'zod'

export const createConsultationSchema = z.object({
  body: z.object({
    doctorId: z.string().cuid(),
    scheduledAt: z.string().datetime(),
    notes: z.string().optional(),
  }),
})

export const updateConsultationSchema = z.object({
  body: z.object({
    scheduledAt: z.string().datetime().optional(),
    notes: z.string().optional(),
    diagnosis: z.string().optional(),
    prescription: z.string().optional(),
  }),
})

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  }),
})

export const getConsultationsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    role: z.enum(['patient', 'doctor']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1),
    type: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
  }),
})

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
})

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>['body']
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>['body']
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>['body']
export type GetConsultationsQuery = z.infer<typeof getConsultationsQuerySchema>['query']
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body']
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body']
