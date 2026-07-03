import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { Country } from '@/types/api.types'

export default function RegisterScreen() {
  router.replace('/(auth)/register/identity')
  return null
}
