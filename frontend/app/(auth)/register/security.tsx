import { useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/register/ProgressBar'
import { useRegisterStore } from '@/stores/register.store'
import { useAuth } from '@/hooks/useAuth'
import { colors } from '@/theme/colors'

export default function RegisterSecurityScreen() {
  const { formData, updateFormData, resetForm } = useRegisterStore()
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const pinRefs = useRef<Array<TextInput | null>>([])

  const handlePinChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return

    const newPin = [...formData.pin]
    newPin[index] = value

    updateFormData({ pin: newPin })

    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus()
    }
  }

  const handlePinKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !formData.pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 8
  }

  const getPasswordStrength = (pwd: string): { label: string; width: string; color: string } => {
    if (pwd.length === 0) return { label: '', width: '0%', color: 'bg-neutral-200' }
    if (pwd.length < 8) return { label: 'Faible', width: '33%', color: 'bg-red-400' }
    if (pwd.length < 12) return { label: 'Moyen', width: '66%', color: 'bg-yellow-400' }
    return { label: 'Fort', width: '100%', color: 'bg-green-400' }
  }

  const handleRegister = async () => {
    if (!formData.password || !formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Champs requis',
        text2: 'Veuillez remplir tous les champs de mot de passe',
      })
      return
    }

    if (!validatePassword(formData.password)) {
      Toast.show({
        type: 'error',
        text1: 'Mot de passe trop court',
        text2: 'Le mot de passe doit contenir au moins 8 caractères',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Mots de passe différents',
        text2: 'Les mots de passe ne correspondent pas',
      })
      return
    }

    const pinFilled = formData.pin.every((digit) => digit !== '')
    if (!pinFilled) {
      Toast.show({
        type: 'error',
        text1: 'Code PIN requis',
        text2: 'Veuillez entrer un code PIN à 6 chiffres',
      })
      return
    }

    if (!formData.termsAccepted) {
      Toast.show({
        type: 'error',
        text1: 'Conditions requises',
        text2: 'Veuillez accepter les Conditions d\'Utilisation',
      })
      return
    }

    try {
      const result = await register({
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: 'PATIENT',
        country: formData.country,
        city: formData.city,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup || undefined,
      })

      Toast.show({
        type: 'success',
        text1: 'Inscription réussie',
        text2: result.message,
      })

      resetForm()
      router.replace('/(auth)/verify')
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur d\'inscription',
        text2: error.response?.data?.message || 'Une erreur est survenue',
      })
    }
  }

  const handlePrevious = () => {
    router.back()
  }

  const strength = getPasswordStrength(formData.password)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={handlePrevious} className="mr-3">
              <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-brown-700">MaSanteYa</Text>
            <View className="flex-1" />
          </View>

          <ProgressBar currentStep={4} totalSteps={4} stepLabel="Sécurité" />

          <View className="mb-6">
            <Text className="text-2xl font-bold text-neutral-900 mb-2">
              Sécurisez votre compte
            </Text>
            <Text className="text-base text-neutral-600 leading-6">
              Protégez vos informations de santé avec un mot de passe robuste et un code PIN.
            </Text>
          </View>

          <Text className="text-sm font-medium text-brown-700 mb-2">Mot de passe</Text>
          <View className="h-11 border border-neutral-200 rounded-md bg-neutral-50 px-4 flex-row items-center mb-2">
            <TextInput
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => updateFormData({ password: text })}
              secureTextEntry={!showPassword}
              className="flex-1 text-neutral-900"
              placeholderTextColor={colors.neutral[400]}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>
          {formData.password.length > 0 && (
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-neutral-500">Entrez au moins 8 caractères</Text>
                <Text
                  className={`text-xs font-semibold ${
                    strength.label === 'Fort'
                      ? 'text-green-600'
                      : strength.label === 'Moyen'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {strength.label}
                </Text>
              </View>
              <View className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                <View className={`h-full ${strength.color}`} style={{ width: strength.width }} />
              </View>
            </View>
          )}

          <Text className="text-sm font-medium text-brown-700 mb-2">Confirmer le mot de passe</Text>
          <View className="h-11 border border-neutral-200 rounded-md bg-neutral-50 px-4 flex-row items-center mb-4">
            <TextInput
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData({ confirmPassword: text })}
              secureTextEntry={!showConfirmPassword}
              className="flex-1 text-neutral-900"
              placeholderTextColor={colors.neutral[400]}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color={colors.neutral[400]}
              />
            </TouchableOpacity>
          </View>

          <View className="mt-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-medium text-brown-700">Code PIN à 6 chiffres</Text>
              <Text className="text-xs text-neutral-500">Pour l'accès rapide</Text>
            </View>
            <View className="flex-row justify-between">
              {formData.pin.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (pinRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(value) => handlePinChange(value, index)}
                  onKeyPress={({ nativeEvent: { key } }) => handlePinKeyPress(key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className="w-12 h-14 border-2 border-neutral-200 rounded-xl bg-neutral-50 text-center text-xl font-semibold text-neutral-900"
                  secureTextEntry
                />
              ))}
            </View>
          </View>

          <View className="bg-brown-50 rounded-2xl p-4 flex-row items-center mt-6 mb-4">
            <View className="w-12 h-12 bg-brown-200 rounded-full items-center justify-center mr-3">
              <Ionicons name="finger-print" size={28} color={colors.brown[700]} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900 mb-0.5">Biométrie</Text>
              <Text className="text-sm text-neutral-600">Face ID ou Empreinte</Text>
            </View>
            <Switch
              value={formData.biometricEnabled}
              onValueChange={(value) => updateFormData({ biometricEnabled: value })}
              trackColor={{ false: '#D1D5DB', true: '#C19A6B' }}
              thumbColor={formData.biometricEnabled ? colors.brown[400] : '#F3F4F6'}
            />
          </View>

          <TouchableOpacity
            onPress={() => updateFormData({ termsAccepted: !formData.termsAccepted })}
            className="flex-row items-start mt-4 mb-6"
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                formData.termsAccepted ? 'bg-brown-400 border-brown-400' : 'border-neutral-300'
              }`}
            >
              {formData.termsAccepted && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className="flex-1 text-sm text-neutral-700 leading-5">
              J'accepte les{' '}
              <Text className="text-brown-600 font-semibold underline">
                Conditions d'Utilisation
              </Text>{' '}
              et la{' '}
              <Text className="text-brown-600 font-semibold underline">
                Politique de Confidentialité
              </Text>{' '}
              de MaSanteYa.
            </Text>
          </TouchableOpacity>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleRegister}
            rightIcon={<Ionicons name="arrow-forward" size={20} color="white" />}
          >
            S'inscrire
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
