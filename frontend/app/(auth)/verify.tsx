import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

export default function VerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(120)
  const { verifyOtp, resendOtp, isLoading } = useAuth()
  const inputRefs = useRef<(TextInput | null)[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const otpArray = value.split('').slice(0, 6)
      setOtp(otpArray.concat(Array(6 - otpArray.length).fill('')))
      inputRefs.current[5]?.focus()
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Code incomplet',
        text2: 'Veuillez entrer les 6 chiffres du code',
      })
      return
    }

    try {
      await verifyOtp(otpCode)
      Toast.show({
        type: 'success',
        text1: 'Vérification réussie',
        text2: 'Votre compte a été activé',
      })
      router.replace('/(app)/home')
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Code invalide',
        text2: error.response?.data?.message || 'Veuillez vérifier le code',
      })
    }
  }

  const handleResend = async () => {
    try {
      await resendOtp()
      setTimer(120)
      setOtp(['', '', '', '', '', ''])
      Toast.show({
        type: 'success',
        text1: 'Code renvoyé',
        text2: 'Un nouveau code a été envoyé',
      })
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error.response?.data?.message || 'Impossible de renvoyer le code',
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4"
          >
            <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
          </TouchableOpacity>

          <View className="items-center mb-8">
            <View className="bg-brown-100 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="mail" size={40} color={colors.brown[400]} />
            </View>
            <Text className="text-3xl font-bold text-brown-700 mb-2">Vérification</Text>
            <Text className="text-base text-neutral-600 text-center">
              Entrez le code à 6 chiffres envoyé à votre email
            </Text>
          </View>

          <View className="flex-row justify-between mb-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border-2 border-neutral-200 rounded-lg text-center text-xl font-semibold text-brown-700 focus:border-brown-400"
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-center text-neutral-600 mb-2">
              {timer > 0 ? (
                <>Le code expire dans <Text className="font-semibold text-brown-700">{formatTime(timer)}</Text></>
              ) : (
                <Text className="text-danger">Le code a expiré</Text>
              )}
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleVerify}
          >
            Vérifier
          </Button>

          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0}
            className="mt-6"
          >
            <Text className={`text-center font-semibold ${
              timer > 0 ? 'text-neutral-400' : 'text-brown-400'
            }`}>
              Renvoyer le code
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
