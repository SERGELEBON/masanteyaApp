import { z } from 'zod'

export const searchPharmaciesSchema = z.object({
  query: z.object({
    latitude: z.string().transform(Number),
    longitude: z.string().transform(Number),
    radius: z.string().transform(Number).optional(),
    country: z.enum(['GH', 'GN']).optional(),
    isOpen: z.enum(['true', 'false']).optional(),
    isOnDuty: z.enum(['true', 'false']).optional(),
    acceptsNHIS: z.enum(['true', 'false']).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export const searchMedicationSchema = z.object({
  query: z.object({
    medication: z.string().min(2),
    latitude: z.string().transform(Number).optional(),
    longitude: z.string().transform(Number).optional(),
    radius: z.string().transform(Number).optional(),
    country: z.enum(['GH', 'GN']).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export type SearchPharmaciesQuery = z.infer<typeof searchPharmaciesSchema>['query']
export type SearchMedicationQuery = z.infer<typeof searchMedicationSchema>['query']