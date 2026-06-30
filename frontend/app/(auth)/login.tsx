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

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Champs requis',
        text2: 'Veuillez remplir tous les champs',
      })
      return
    }

    try {
      await login(email.trim(), password)
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Bienvenue sur MaSanteYa!',
      })
      router.replace('/(app)/home')
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: error.response?.data?.message || 'Vérifiez vos identifiants',
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
          <View className="flex-1 justify-center py-8">
            <View className="items-center mb-8">
              <View className="bg-brown-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="medical" size={40} color={colors.brown[400]} />
              </View>
              <Text className="text-3xl font-bold text-brown-700">Connexion</Text>
              <Text className="text-base text-neutral-600 mt-2">
                Connectez-vous à votre compte
              </Text>
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
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.neutral[400]} />}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password' as any)}
              className="mb-6"
            >
              <Text className="text-brown-400 text-right font-medium">
                Mot de passe oublié?
              </Text>
            </TouchableOpacity>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleLogin}
            >
              Se connecter
            </Button>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-neutral-600">Pas encore de compte? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-brown-400 font-semibold">S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
