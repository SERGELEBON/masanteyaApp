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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [country, setCountry] = useState<Country>('GH')
  const { register, isLoading } = useAuth()

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Champs requis',
        text2: 'Veuillez remplir tous les champs',
      })
      return
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Mots de passe différents',
        text2: 'Les mots de passe ne correspondent pas',
      })
      return
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Mot de passe trop court',
        text2: 'Le mot de passe doit contenir au moins 8 caractères',
      })
      return
    }

    try {
      const result = await register({
        email: email.trim(),
        phone: phone.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'PATIENT',
        country,
      })

      Toast.show({
        type: 'success',
        text1: 'Inscription réussie',
        text2: result.message,
      })

      router.replace('/(auth)/verify')
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur d\'inscription',
        text2: error.response?.data?.message || 'Une erreur est survenue',
      })
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="py-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-4"
            >
              <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-brown-700 mb-2">Inscription</Text>
            <Text className="text-base text-neutral-600 mb-6">
              Créez votre compte MaSanteYa
            </Text>

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => setCountry('GH')}
                className={`flex-1 h-12 rounded-md border-2 items-center justify-center ${
                  country === 'GH' ? 'border-brown-400 bg-brown-50' : 'border-neutral-200'
                }`}
              >
                <Text className="text-2xl mb-1">🇬🇭</Text>
                <Text className={`text-sm font-medium ${
                  country === 'GH' ? 'text-brown-700' : 'text-neutral-600'
                }`}>
                  Ghana
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCountry('GN')}
                className={`flex-1 h-12 rounded-md border-2 items-center justify-center ${
                  country === 'GN' ? 'border-brown-400 bg-brown-50' : 'border-neutral-200'
                }`}
              >
                <Text className="text-2xl mb-1">🇬🇳</Text>
                <Text className={`text-sm font-medium ${
                  country === 'GN' ? 'text-brown-700' : 'text-neutral-600'
                }`}>
                  Guinée
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <Input
                  label="Prénom"
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Nom"
                  placeholder="Doe"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.neutral[400]} />}
            />

            <Input
              label="Téléphone"
              placeholder={country === 'GH' ? '+233 50 123 4567' : '+224 62 123 4567'}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Ionicons name="call-outline" size={20} color={colors.neutral[400]} />}
            />

            <Input
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.neutral[400]} />}
            />

            <Input
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.neutral[400]} />}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleRegister}
            >
              S'inscrire
            </Button>

            <View className="flex-row justify-center items-center mt-6 mb-4">
              <Text className="text-neutral-600">Déjà un compte? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-brown-400 font-semibold">Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
