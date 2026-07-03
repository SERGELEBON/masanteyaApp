import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/register/ProgressBar'
import { useRegisterStore } from '@/stores/register.store'
import { colors } from '@/theme/colors'
import type { Country } from '@/types/api.types'

export default function RegisterContactScreen() {
  const { formData, updateFormData } = useRegisterStore()

  const getDialCode = (country: Country) => {
    return country === 'GH' ? '+233' : '+224'
  }

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    let formatted = cleaned

    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2)
    }
    if (cleaned.length >= 5) {
      formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + ' ' + cleaned.slice(5, 9)
    }

    return formatted
  }

  const handleNext = () => {
    if (!formData.country || !formData.phone || !formData.email || !formData.city) {
      Toast.show({
        type: 'error',
        text1: 'Champs requis',
        text2: 'Veuillez remplir tous les champs',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Email invalide',
        text2: 'Veuillez entrer une adresse email valide',
      })
      return
    }

    router.push('/(auth)/register/insurance')
  }

  const handlePrevious = () => {
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.brown[700]} />
              <Text className="text-2xl font-bold text-brown-700 ml-2">MaSanteYa</Text>
            </View>
            <TouchableOpacity className="px-4 py-2 bg-brown-50 rounded-full">
              <Text className="text-brown-600 text-sm">Français</Text>
            </TouchableOpacity>
          </View>

          <ProgressBar currentStep={2} totalSteps={4} stepLabel="Informations de contact" />

          <View className="mb-6">
            <Text className="text-2xl font-bold text-neutral-900 mb-2">Parlons de vous</Text>
            <Text className="text-base text-neutral-600 leading-6">
              Veuillez renseigner vos coordonnées pour faciliter le suivi de votre dossier médical.
            </Text>
          </View>

          <Text className="text-sm font-medium text-brown-700 mb-3">Pays de résidence</Text>
          <View className="flex-row space-x-3 mb-4">
            <TouchableOpacity
              onPress={() => updateFormData({ country: 'GH' })}
              className={`flex-1 h-14 rounded-xl px-4 flex-row items-center justify-center border-2 ${
                formData.country === 'GH'
                  ? 'bg-brown-400 border-brown-400'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <Text className="text-2xl mr-3">🇬🇭</Text>
              <Text
                className={`font-medium ${
                  formData.country === 'GH' ? 'text-white' : 'text-neutral-700'
                }`}
              >
                Ghana
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateFormData({ country: 'GN' })}
              className={`flex-1 h-14 rounded-xl px-4 flex-row items-center justify-center border-2 ${
                formData.country === 'GN'
                  ? 'bg-brown-400 border-brown-400'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <Text className="text-2xl mr-3">🇬🇳</Text>
              <Text
                className={`font-medium ${
                  formData.country === 'GN' ? 'text-white' : 'text-neutral-700'
                }`}
              >
                Guinée
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-medium text-brown-700 mb-3">Numéro de téléphone</Text>
          <View className="flex-row h-11 border border-neutral-200 rounded-md bg-neutral-50 overflow-hidden mb-4">
            <View className="w-20 bg-brown-50 items-center justify-center border-r border-neutral-200">
              <Text className="text-brown-600 font-medium">{getDialCode(formData.country)}</Text>
            </View>
            <TextInput
              placeholder="24 123 4567"
              value={formData.phone}
              onChangeText={(text) => updateFormData({ phone: formatPhone(text) })}
              keyboardType="phone-pad"
              maxLength={12}
              className="flex-1 px-4 text-neutral-900"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <Input
            label="Adresse email"
            placeholder="exemple@mail.com"
            value={formData.email}
            onChangeText={(text) => updateFormData({ email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            rightIcon={<Text className="text-2xl text-neutral-400">@</Text>}
          />

          <Input
            label="Ville"
            placeholder="Commencez à taper..."
            value={formData.city}
            onChangeText={(text) => updateFormData({ city: text })}
            rightIcon={<Ionicons name="business-outline" size={20} color={colors.neutral[400]} />}
          />

          <View className="mt-6 mb-4 bg-brown-50 rounded-2xl p-4 flex-row">
            <View className="w-12 h-12 bg-brown-200 rounded-full items-center justify-center mr-3">
              <Ionicons name="help-circle-outline" size={24} color={colors.brown[700]} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900 mb-1">
                Besoin d'aide ?
              </Text>
              <Text className="text-sm text-neutral-600 leading-5">
                Nos agents locaux sont disponibles 24/7 pour vous assister dans votre inscription.
              </Text>
            </View>
          </View>

          <View className="space-y-3 mt-6">
            <TouchableOpacity
              onPress={handlePrevious}
              className="h-11 bg-transparent items-center justify-center rounded-md border-2 border-brown-400 flex-row"
            >
              <Ionicons name="arrow-back" size={20} color={colors.brown[700]} />
              <Text className="text-brown-700 font-semibold text-base ml-2">Précédent</Text>
            </TouchableOpacity>

            <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
              Suivant
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
