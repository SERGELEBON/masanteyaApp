import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import { authApi } from '@/api/auth.api'
import type { User, RegisterPayload } from '@/types/api.types'

const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) =>
    await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) =>
    await SecureStore.deleteItemAsync(name),
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<{ userId: string; message: string }>
  verifyOtp: (code: string, type: 'email' | 'phone') => Promise<void>
  resendOtp: (type: 'email' | 'phone') => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, accessToken, refreshToken } = await authApi.login(email, password)
          await SecureStore.setItemAsync('access_token', accessToken)
          await SecureStore.setItemAsync('refresh_token', refreshToken)
          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? 'Erreur de connexion',
            isLoading: false
          })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const result = await authApi.register(data)
          set({ isLoading: false })
          return result
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? 'Erreur d\'inscription',
            isLoading: false
          })
          throw err
        }
      },

      logout: async () => {
        const refreshToken = await SecureStore.getItemAsync('refresh_token')
        if (refreshToken) {
          await authApi.logout(refreshToken).catch(() => {})
        }
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      setUser: (user) => set({ user }),

      verifyOtp: async (code, type) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.verifyOtp(code, type)
          set({ isLoading: false })
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? 'Code invalide',
            isLoading: false
          })
          throw err
        }
      },

      resendOtp: async (type) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.resendOtp(type)
          set({ isLoading: false })
        } catch (err: any) {
          set({
            error: err.response?.data?.message ?? 'Erreur d\'envoi',
            isLoading: false
          })
          throw err
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)
