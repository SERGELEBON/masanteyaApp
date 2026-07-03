import { create } from 'zustand'
import type { Country, BloodGroup } from '@/types/api.types'

interface RegisterFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  bloodGroup: BloodGroup | null
  profileImage: string | null
  country: Country
  phone: string
  email: string
  city: string
  hasInsurance: boolean
  nhisNumber: string
  cardFrontImage: string | null
  cardBackImage: string | null
  password: string
  confirmPassword: string
  pin: string[]
  biometricEnabled: boolean
  termsAccepted: boolean
}

interface RegisterStore {
  formData: RegisterFormData
  currentStep: number

  updateFormData: (data: Partial<RegisterFormData>) => void
  nextStep: () => void
  previousStep: () => void
  resetForm: () => void
}

const initialFormData: RegisterFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  bloodGroup: null,
  profileImage: null,
  country: 'GH',
  phone: '',
  email: '',
  city: '',
  hasInsurance: true,
  nhisNumber: '',
  cardFrontImage: null,
  cardBackImage: null,
  password: '',
  confirmPassword: '',
  pin: ['', '', '', '', '', ''],
  biometricEnabled: false,
  termsAccepted: false,
}

export const useRegisterStore = create<RegisterStore>((set) => ({
  formData: initialFormData,
  currentStep: 1,

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),

  previousStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  resetForm: () =>
    set({
      formData: initialFormData,
      currentStep: 1,
    }),
}))