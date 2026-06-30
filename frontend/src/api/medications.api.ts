import { apiClient } from './client'
import type { Medication, MedicationForm, ApiResponse } from '@/types/api.types'

export const medicationsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<ApiResponse<Medication[]>>('/medications')
    return data.data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Medication>>(`/medications/${id}`)
    return data.data
  },

  create: async (medication: {
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
  }) => {
    const { data } = await apiClient.post<ApiResponse<Medication>>('/medications', medication)
    return data.data
  },

  update: async (id: string, updates: Partial<Medication>) => {
    const { data } = await apiClient.patch<ApiResponse<Medication>>(`/medications/${id}`, updates)
    return data.data
  },

  markIntake: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/medications/${id}/intake`, {
      takenAt: new Date().toISOString(),
    })
    return data.data
  },

  getRemindersToday: async () => {
    const { data } = await apiClient.get<ApiResponse<any>>('/medications/reminders/today')
    return data.data
  },
}