import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Numéro de téléphone invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    firstName: z.string().min(2, 'Prénom requis'),
    lastName: z.string().min(2, 'Nom requis'),
    role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACIST']).default('PATIENT'),
    country: z.enum(['GH', 'GN']),
    city: z.string().optional(),
    dateOfBirth: z.string().optional(),
    bloodGroup: z
      .enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG'])
      .optional(),
    specialty: z.string().optional(),
    licenseNumber: z.string().optional(),
    hospital: z.string().optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requis'),
  }),
})

export const verifyOtpSchema = z.object({
  body: z.object({
    userId: z.string(),
    code: z.string().length(6, 'Code doit contenir 6 chiffres'),
    type: z.enum(['EMAIL_VERIFY', 'PHONE_VERIFY', 'PASSWORD_RESET']),
  }),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email invalide'),
  }),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    code: z.string().length(6),
    email: z.string().email(),
    newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  }),
})

export const resendOtpSchema = z.object({
  body: z.object({
    userId: z.string(),
    type: z.enum(['EMAIL_VERIFY', 'PHONE_VERIFY']),
  }),
})
