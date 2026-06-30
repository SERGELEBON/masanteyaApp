import { apiClient } from './client'
import type { VitalSign, VitalType, ApiResponse } from '@/types/api.types'

export const vitalsApi = {
  record: async (vital: {
    type: VitalType
    value: any
    unit: string
    deviceId?: string
  }) => {
    const { data } = await apiClient.post<ApiResponse<VitalSign>>('/vitals', vital)
    return data.data
  },

  getHistory: async (params?: { type?: VitalType; from?: string; to?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<ApiResponse<VitalSign[]>>('/vitals', { params })
    return data.data
  },

  getLatest: async () => {
    const { data } = await apiClient.get<ApiResponse<Record<VitalType, VitalSign | null>>>('/vitals/latest')
    return data.data
  },

  getStats: async (params?: { from?: string; to?: string }) => {
    const { data } = await apiClient.get<ApiResponse<any>>('/vitals/stats', { params })
    return data.data
  },
}