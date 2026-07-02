import { z } from 'zod'

export const createRecordSchema = z.object({
  body: z.object({
    type: z.enum(['CONSULTATION', 'LAB_RESULT', 'PRESCRIPTION', 'HOSPITALIZATION', 'IMAGING', 'VACCINATION']),
    title: z.string().min(3),
    doctorName: z.string().min(2),
    hospital: z.string().min(2),
    summary: z.string().optional(),
    date: z.string().datetime(),
    tags: z.array(z.string()).optional(),
  }),
})

export const updateRecordSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    doctorName: z.string().min(2).optional(),
    hospital: z.string().min(2).optional(),
    summary: z.string().optional(),
    date: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
  }),
})

export const getRecordsQuerySchema = z.object({
  query: z.object({
    type: z.enum(['CONSULTATION', 'LAB_RESULT', 'PRESCRIPTION', 'HOSPITALIZATION', 'IMAGING', 'VACCINATION']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    tags: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export const shareRecordSchema = z.object({
  body: z.object({
    doctorIds: z.array(z.string()),
  }),
})

export type CreateRecordInput = z.infer<typeof createRecordSchema>['body']
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>['body']
export type GetRecordsQuery = z.infer<typeof getRecordsQuerySchema>['query']
export type ShareRecordInput = z.infer<typeof shareRecordSchema>['body']