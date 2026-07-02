import { z } from 'zod'

export const createMedicationSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    dosage: z.string(),
    form: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'DROPS']),
    frequency: z.string(),
    times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    refillDate: z.string().datetime().optional(),
    stockRemaining: z.number().int().min(0).optional(),
    prescribedBy: z.string().min(2),
  }),
})

export const updateMedicationSchema = z.object({
  body: z.object({
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).optional(),
    endDate: z.string().datetime().optional(),
    refillDate: z.string().datetime().optional(),
    stockRemaining: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
})

export const getMedicationsQuerySchema = z.object({
  query: z.object({
    isActive: z.enum(['true', 'false']).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export const recordIntakeSchema = z.object({
  body: z.object({
    scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    takenAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
})

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>['body']
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>['body']
export type GetMedicationsQuery = z.infer<typeof getMedicationsQuerySchema>['query']
export type RecordIntakeInput = z.infer<typeof recordIntakeSchema>['body']
