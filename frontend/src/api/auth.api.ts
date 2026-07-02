import { apiClient } from './client'
import type { LoginResponse, RegisterPayload, ApiResponse } from '@/types/api.types'

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<ApiResponse<{ userId: string; message: string }>>('/auth/register', payload)
    return data.data
  },

  verifyOtp: async (code: string, type: 'email' | 'phone') => {
    const endpoint = type === 'email' ? '/auth/verify-email' : '/auth/verify-phone'
    const otpType = type === 'email' ? 'EMAIL_VERIFY' : 'PHONE_VERIFY'
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>(endpoint, {
      code,
      type: otpType,
    })
    return data.data
  },

  resendOtp: async (type: 'email' | 'phone') => {
    const otpType = type === 'email' ? 'EMAIL_VERIFY' : 'PHONE_VERIFY'
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', { type: otpType })
    return data.data
  },

  logout: async (refreshToken: string) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout', { refreshToken })
    return data.data
  },

  verifyEmail: async (userId: string, code: string) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', {
      userId,
      code,
      type: 'EMAIL_VERIFY',
    })
    return data.data
  },

  verifyPhone: async (userId: string, code: string) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-phone', {
      userId,
      code,
      type: 'PHONE_VERIFY',
    })
    return data.data
  },

  resendOtp: async (userId: string, type: 'EMAIL_VERIFY' | 'PHONE_VERIFY') => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', { userId, type })
    return data.data
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
    return data.data
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const { data } = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      email,
      code,
      newPassword,
    })
    return data.data
  },
}
