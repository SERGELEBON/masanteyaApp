import { apiClient } from './client'
import type { User, ApiResponse } from '@/types/api.types'

export const usersApi = {
  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse<User>>('/users/me')
    return data.data
  },

  updateProfile: async (updates: Partial<User>) => {
    const { data } = await apiClient.patch<ApiResponse<User>>('/users/me', updates)
    return data.data
  },

  uploadAvatar: async (file: FormData) => {
    const { data } = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/users/me/avatar', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  updatePushToken: async (token: string) => {
    const { data } = await apiClient.patch<ApiResponse<{ message: string }>>('/users/me', {
      pushToken: token,
    })
    return data.data
  },
}