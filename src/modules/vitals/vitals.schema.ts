import { z } from 'zod'

export const createVitalSchema = z.object({
  body: z.object({
    type: z.enum(['HEART_RATE', 'BLOOD_PRESSURE', 'GLUCOSE', 'SPO2', 'TEMPERATURE', 'WEIGHT']),
    valueJson: z.record(z.any()),
    unit: z.string(),
    deviceId: z.string().optional(),
    measuredAt: z.string().datetime().optional(),
  }),
})

export const getVitalsQuerySchema = z.object({
  query: z.object({
    type: z.enum(['HEART_RATE', 'BLOOD_PRESSURE', 'GLUCOSE', 'SPO2', 'TEMPERATURE', 'WEIGHT']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export type CreateVitalInput = z.infer<typeof createVitalSchema>['body']
export type GetVitalsQuery = z.infer<typeof getVitalsQuerySchema>['query']