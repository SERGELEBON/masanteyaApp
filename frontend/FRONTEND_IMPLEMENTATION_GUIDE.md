# MaSanteYa Mobile App - Frontend Implementation Guide

## 🎯 Project Status

✅ **Configuration Complete**
- package.json with all dependencies
- app.json with Expo configuration
- tsconfig.json with path aliases
- tailwind.config.js with custom colors
- babel.config.js with NativeWind

✅ **Theme System Complete**
- src/theme/colors.ts - Brown/Blue color palette
- src/theme/typography.ts - Typography scale
- src/theme/tokens.ts - Border radius, spacing, shadows

## 📁 Project Structure Created

```
frontend/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Auth screens (onboarding, login, register)
│   ├── (app)/               # Main app screens (bottom tabs)
│   └── (features)/          # Feature screens (consultation, vitals, etc.)
├── src/
│   ├── theme/               # ✅ COMPLETE
│   ├── types/               # TypeScript types
│   ├── api/                 # API client + services
│   ├── socket/              # Socket.io client
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom hooks
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   └── utils/               # Utility functions
└── assets/                  # Images, icons
```

## 🚀 Next Steps - Implementation Order

### 1. Install Dependencies

```bash
cd frontend
npm install
```

###  2. Create Type Definitions

**src/types/api.types.ts**

```typescript
// User & Auth Types
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
}

// Doctor Types
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
}

// Vital Signs Types
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

// Add more types as needed for Medications, Records, Pharmacy, etc.
```

### 3. Create API Client with JWT Auto-Refresh

**src/api/client.ts**

```typescript
import axios, { AxiosInstance } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

const API_URL = process.env.EXPO_PUBLIC_API_URL!

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  )
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })

        const newAccessToken = data.data.accessToken
        await SecureStore.setItemAsync('access_token', newAccessToken)

        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
        router.replace('/(auth)/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

### 4. Create API Services

**src/api/auth.api.ts**

```typescript
import { apiClient } from './client'
import type { LoginResponse, RegisterPayload } from '@/types/api.types'

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<{ data: LoginResponse }>('/auth/login', {
      email,
      password,
    })
    return data.data
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post('/auth/register', payload)
    return data.data
  },

  logout: async (refreshToken: string) => {
    const { data } = await apiClient.post('/auth/logout', { refreshToken })
    return data.data
  },

  verifyEmail: async (userId: string, code: string) => {
    const { data } = await apiClient.post('/auth/verify-email', {
      userId,
      code,
      type: 'EMAIL_VERIFY',
    })
    return data.data
  },

  verifyPhone: async (userId: string, code: string) => {
    const { data } = await apiClient.post('/auth/verify-phone', {
      userId,
      code,
      type: 'PHONE_VERIFY',
    })
    return data.data
  },

  resendOtp: async (userId: string, type: 'EMAIL_VERIFY' | 'PHONE_VERIFY') => {
    const { data } = await apiClient.post('/auth/resend-otp', { userId, type })
    return data.data
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email })
    return data.data
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/reset-password', {
      email,
      code,
      newPassword,
    })
    return data.data
  },
}
```

Create similar files for:
- **src/api/users.api.ts** - User profile, avatar upload
- **src/api/doctors.api.ts** - Doctor search, availability
- **src/api/consultations.api.ts** - Book, start, end consultations
- **src/api/vitals.api.ts** - Record vitals, get history
- **src/api/records.api.ts** - Medical records CRUD
- **src/api/medications.api.ts** - Medications management
- **src/api/delivery.api.ts** - Orders, tracking
- **src/api/insurance.api.ts** - Insurance management
- **src/api/pharmfind.api.ts** - Pharmacy search

### 5. Create Zustand Auth Store

**src/stores/auth.store.ts**

```typescript
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
  register: (data: RegisterPayload) => Promise<{ userId: string }>
  logout: () => Promise<void>
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

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)
```

### 6. Create Socket.io Client

**src/socket/socket.client.ts**

```typescript
import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await SecureStore.getItemAsync('access_token')

  socket = io(process.env.EXPO_PUBLIC_SOCKET_URL!, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => console.log('✅ Socket connecté:', socket?.id))
  socket.on('disconnect', (reason) => console.log('❌ Socket déconnecté:', reason))
  socket.on('connect_error', (err) => console.error('⚠️ Socket erreur:', err.message))

  return socket
}

export async function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
```

### 7. Create Custom Hooks

**src/hooks/useAuth.ts**

```typescript
import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}
```

### 8. Create UI Components

**src/components/ui/Button.tsx**

```typescript
import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { colors } from '@/theme/colors'

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.97)
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1)
    onPressOut?.(e)
  }

  const variantStyles = {
    primary: 'bg-brown-400 active:bg-brown-500',
    secondary: 'bg-blue-400 active:bg-blue-500',
    outline: 'border-2 border-brown-400 bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-danger active:bg-red-700',
  }

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-brown-400',
    ghost: 'text-brown-400',
    danger: 'text-white',
  }

  const sizeStyles = {
    sm: 'h-9 px-3',
    md: 'h-11 px-4',
    lg: 'h-14 px-6',
  }

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        rounded-md flex-row items-center justify-center
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.brown[400] : colors.white} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${textStyles[variant]} ${textSizeStyles[size]} font-semibold`}>
            {children}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </AnimatedTouchable>
  )
}
```

Create similar components for:
- **Input.tsx** - Text input with label, error states
- **OTPInput.tsx** - 6-digit OTP input
- **PhoneInput.tsx** - Phone with country code
- **Card.tsx** - Container with variants
- **Badge.tsx** - Status badges
- **Avatar.tsx** - User avatar
- **ProgressBar.tsx** - Progress indicator
- **Skeleton.tsx** - Loading skeleton

### 9. Create App Layout & Navigation

**app/_layout.tsx**

```typescript
import '../global.css'
import { useEffect } from 'react'
import { Slot, SplashScreen } from 'expo-router'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import Toast from 'react-native-toast-message'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Slot />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

**app/index.tsx**

```typescript
import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'

export default function Index() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />
  }

  return <Redirect href="/(auth)/onboarding" />
}
```

### 10. Create Authentication Screens

**app/(auth)/_layout.tsx**

```typescript
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
```

**app/(auth)/login.tsx**

```typescript
import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import Toast from 'react-native-toast-message'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    try {
      await login(email, password)
      router.replace('/(app)/home')
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue sur MaSanteYa!',
      })
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.message || 'Vérifiez vos identifiants',
      })
    }
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-brown-700 mb-8">Connexion</Text>

      <View className="mb-4">
        <Text className="text-sm font-medium text-brown-700 mb-2">Email</Text>
        <TextInput
          className="border border-neutral-200 rounded-md px-4 h-11 bg-neutral-50"
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-brown-700 mb-2">Mot de passe</Text>
        <TextInput
          className="border border-neutral-200 rounded-md px-4 h-11 bg-neutral-50"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isLoading}
        onPress={handleLogin}
      >
        Se connecter
      </Button>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push('/(auth)/register')}
      >
        <Text className="text-center text-brown-400">
          Pas encore de compte? <Text className="font-semibold">S'inscrire</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

## 📚 Implementation Templates

### Home Screen Template

```typescript
// app/(app)/home.tsx
import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { usersApi } from '@/api/users.api'
import { vitalsApi } from '@/api/vitals.api'
import { Skeleton } from '@/components/ui/Skeleton'
import { VitalCard } from '@/components/features/VitalCard'

export default function HomeScreen() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [vitals, setVitals] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [userData, vitalsData] = await Promise.all([
        usersApi.getMe(),
        vitalsApi.getLatest(),
      ])
      setUser(userData)
      setVitals(vitalsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Skeleton variant="home" />
  }

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="p-6">
        <Text className="text-2xl font-bold text-brown-700">
          Bonjour {user?.firstName}!
        </Text>

        {/* Add VitalCards, Service Grid, etc. */}
      </View>
    </ScrollView>
  )
}
```

## 🔧 Installation & Running

```bash
# Install dependencies
cd frontend
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📋 Implementation Checklist

For each screen/feature:
- [ ] Create API service methods
- [ ] Create Zustand store if needed
- [ ] Create UI components
- [ ] Create screen with loading states
- [ ] Add error handling with Toast
- [ ] Add empty states
- [ ] Test with backend API
- [ ] Add Socket.io events if needed

## 🎨 Figma Prototype Reference

Follow the design from: https://stitch.withgoogle.com/preview/598638291182385808

## 📝 Notes

- All colors from `theme/colors.ts`
- All API calls go through `apiClient`
- Loading states use Skeleton components
- Errors show Toast messages
- Socket.io for real-time features
- Secure storage for tokens
- Biometrics for auth (optional)

## 🚀 Next Priority

1. Complete all API service files
2. Create all UI components
3. Implement all screens following the templates
4. Add Socket.io real-time features
5. Test end-to-end with backend

---

**The frontend foundation is ready! Follow this guide to complete the implementation.**
