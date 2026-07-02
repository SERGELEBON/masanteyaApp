import { z } from 'zod'

export const getDoctorsQuerySchema = z.object({
  query: z.object({
    country: z.enum(['GH', 'GN']).optional(),
    specialty: z.string().optional(),
    city: z.string().optional(),
    isOnline: z.enum(['true', 'false']).optional(),
    acceptsNHIS: z.enum(['true', 'false']).optional(),
    minRating: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
  }),
})

export const updateDoctorProfileSchema = z.object({
  body: z.object({
    specialty: z.string().min(2).optional(),
    hospital: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    bio: z.string().optional(),
    consultationFee: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    acceptsNHIS: z.boolean().optional(),
    languages: z.array(z.string()).optional(),
    yearsExperience: z.number().int().min(0).optional(),
  }),
})

export const setAvailabilitySchema = z.object({
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),
})

export const updateOnlineStatusSchema = z.object({
  body: z.object({
    isOnline: z.boolean(),
  }),
})

export type GetDoctorsQuery = z.infer<typeof getDoctorsQuerySchema>['query']
export type UpdateDoctorProfileInput = z.infer<typeof updateDoctorProfileSchema>['body']
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>['body']
export type UpdateOnlineStatusInput = z.infer<typeof updateOnlineStatusSchema>['body']