import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '@/theme/colors'

export default function Index() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    if (!user.isEmailVerified) {
      return <Redirect href="/(auth)/verify" />
    }
    return <Redirect href="/(app)/home" />
  }

  return <Redirect href="/(auth)/onboarding" />
}
