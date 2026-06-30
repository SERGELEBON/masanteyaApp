import { apiClient } from './client'
import type { Doctor, ApiResponse, PaginatedResponse, Country } from '@/types/api.types'

interface DoctorSearchParams {
  country?: Country
  specialty?: string
  isOnline?: boolean
  acceptsNHIS?: boolean
  search?: string
  page?: number
  limit?: number
}

export const doctorsApi = {
  search: async (params: DoctorSearchParams) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>>>('/doctors', { params })
    return data.data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}`)
    return data.data
  },

  getAvailability: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/doctors/${id}/availability`)
    return data.data
  },
}