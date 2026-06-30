import { apiClient } from './client'
import type { Pharmacy, Country, ApiResponse } from '@/types/api.types'

export const pharmfindApi = {
  searchNearby: async (params: {
    lat: number
    lng: number
    medication: string
    country: Country
    radius?: number
    nhis?: boolean
  }) => {
    const { data } = await apiClient.get<ApiResponse<Pharmacy[]>>('/pharmfind/search', { params })
    return data.data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Pharmacy>>(`/pharmfind/pharmacies/${id}`)
    return data.data
  },

  getOnDuty: async (country: Country) => {
    const { data } = await apiClient.get<ApiResponse<Pharmacy[]>>('/pharmfind/duty', {
      params: { country },
    })
    return data.data
  },
}