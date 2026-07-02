import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    dateOfBirth: z.string().datetime().optional(),
    bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG']).optional(),
    city: z.string().optional(),
    phone: z.string().min(10).optional(),
  }),
})

export const uploadAvatarSchema = z.object({
  file: z.any(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
