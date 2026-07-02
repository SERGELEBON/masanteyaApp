import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
    role: string
    country: string
    email: string
  }
}

export interface MulterRequest extends AuthRequest {
  file?: any
  files?: any[]
}

export type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN'
export type Country = 'GH' | 'GN'
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'O_POS' | 'O_NEG' | 'AB_POS' | 'AB_NEG'
export type ConsultationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type VitalType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'GLUCOSE' | 'SPO2' | 'TEMPERATURE' | 'WEIGHT'
export type VitalStatus = 'NORMAL' | 'WARNING' | 'CRITICAL'
export type RecordType = 'CONSULTATION' | 'LAB_RESULT' | 'PRESCRIPTION' | 'HOSPITALIZATION' | 'IMAGING' | 'VACCINATION'
export type MedicationForm = 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'
export type InsuranceProvider = 'NHIS' | 'NSIA'
export type OtpType = 'EMAIL_VERIFY' | 'PHONE_VERIFY' | 'PASSWORD_RESET'
