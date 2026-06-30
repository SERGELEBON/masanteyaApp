export type Country = 'GH' | 'GN'
export type UserRole = 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN'
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'O_POS' | 'O_NEG' | 'AB_POS' | 'AB_NEG'

export interface User {
  id: string
  email: string
  phone: string
  role: UserRole
  firstName: string
  lastName: string
  dateOfBirth?: string
  bloodGroup?: BloodGroup
  country: Country
  city?: string
  avatarUrl?: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterPayload {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  country: Country
  city?: string
  dateOfBirth?: string
  bloodGroup?: BloodGroup
  specialty?: string
  licenseNumber?: string
  hospital?: string
}

export type ConsultationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Doctor {
  id: string
  userId: string
  specialty: string
  licenseNumber: string
  hospital: string
  city: string
  country: Country
  bio?: string
  consultationFee: number
  currency: string
  isOnline: boolean
  acceptsNHIS: boolean
  languages: string[]
  rating: number
  reviewCount: number
  yearsExperience: number
  user?: User
}

export interface Consultation {
  id: string
  patientId: string
  doctorId: string
  status: ConsultationStatus
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  durationMin?: number
  notes?: string
  diagnosis?: string
  prescription?: string
  fee: number
  currency: string
  isPaidByNHIS: boolean
  roomId?: string
  createdAt: string
  updatedAt: string
}

export type VitalType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'GLUCOSE' | 'SPO2' | 'TEMPERATURE' | 'WEIGHT'
export type VitalStatus = 'NORMAL' | 'WARNING' | 'CRITICAL'

export interface VitalSign {
  id: string
  patientId: string
  type: VitalType
  valueJson: Record<string, unknown>
  unit: string
  status: VitalStatus
  deviceId?: string
  measuredAt: string
  createdAt: string
}

export type RecordType = 'CONSULTATION' | 'LAB_RESULT' | 'PRESCRIPTION' | 'HOSPITALIZATION' | 'IMAGING' | 'VACCINATION'

export interface MedicalRecord {
  id: string
  patientId: string
  type: RecordType
  title: string
  doctorName: string
  hospital: string
  summary?: string
  date: string
  fileUrls: string[]
  tags: string[]
  isShared: boolean
  sharedWith: string[]
  createdAt: string
  updatedAt: string
}

export type MedicationForm = 'TABLET' | 'CAPSULE' | 'SYRUP' | 'INJECTION' | 'CREAM' | 'DROPS'

export interface Medication {
  id: string
  patientId: string
  name: string
  dosage: string
  form: MedicationForm
  frequency: string
  times: string[]
  startDate: string
  endDate?: string
  refillDate?: string
  stockRemaining: number
  prescribedBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Pharmacy {
  id: string
  name: string
  address: string
  city: string
  country: Country
  phone: string
  latitude: number
  longitude: number
  isOpen: boolean
  isOnDuty: boolean
  openingHours: string
  acceptsNHIS: boolean
  rating: number
  isVerified: boolean
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  patientId: string
  status: OrderStatus
  totalAmount: number
  currency: string
  deliveryAddress: string
  deliveryLat?: number
  deliveryLng?: number
  courierName?: string
  courierPhone?: string
  courierLat?: number
  courierLng?: number
  estimatedMinutes?: number
  isPaidByNHIS: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export type InsuranceProvider = 'NHIS' | 'NSIA'

export interface Insurance {
  id: string
  patientId: string
  provider: InsuranceProvider
  memberNumber: string
  holderName: string
  validFrom: string
  validUntil: string
  annualLimit: number
  usedAmount: number
  currency: string
  cardImageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}
