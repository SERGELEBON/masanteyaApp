import { z } from 'zod'

export const createInsuranceSchema = z.object({
  body: z.object({
    provider: z.enum(['NHIS', 'NSIA']),
    memberNumber: z.string().min(5),
    holderName: z.string().min(2),
    validFrom: z.string().datetime(),
    validUntil: z.string().datetime(),
    annualLimit: z.number().positive(),
    currency: z.string().length(3),
  }),
})

export const updateInsuranceSchema = z.object({
  body: z.object({
    holderName: z.string().min(2).optional(),
    validUntil: z.string().datetime().optional(),
    annualLimit: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
})

export const checkCoverageSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
  }),
})

export type CreateInsuranceInput = z.infer<typeof createInsuranceSchema>['body']
export type UpdateInsuranceInput = z.infer<typeof updateInsuranceSchema>['body']
export type CheckCoverageInput = z.infer<typeof checkCoverageSchema>['body']