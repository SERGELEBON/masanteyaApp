import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/register/ProgressBar'
import { useRegisterStore } from '@/stores/register.store'
import { colors } from '@/theme/colors'
import type { Country } from '@/types/api.types'

export default function RegisterInsuranceScreen() {
  const { formData, updateFormData } = useRegisterStore()

  const pickImage = async (side: 'front' | 'back') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission refusée',
        text2: 'Nous avons besoin d\'accéder à vos photos',
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') {
        updateFormData({ cardFrontImage: result.assets[0].uri })
      } else {
        updateFormData({ cardBackImage: result.assets[0].uri })
      }
    }
  }

  const handleNext = () => {
    if (formData.hasInsurance) {
      if (!formData.nhisNumber || !formData.cardFrontImage || !formData.cardBackImage) {
        Toast.show({
          type: 'error',
          text1: 'Informations manquantes',
          text2: 'Veuillez remplir toutes les informations d\'assurance',
        })
        return
      }
    }

    router.push('/(auth)/register/security')
  }

  const handlePrevious = () => {
    router.back()
  }

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
            <Text className="text-sm text-neutral-600">Étape 3 sur 4</Text>
          </View>

          <ProgressBar currentStep={3} totalSteps={4} stepLabel="Assurance" />

          <View className="mb-6">
            <Text className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              Détails de l'assurance
            </Text>
            <Text className="text-base text-neutral-600 text-center leading-6">
              Veuillez fournir les informations relatives à votre couverture santé.
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

          <TouchableOpacity
            onPress={() => updateFormData({ hasInsurance: !formData.hasInsurance })}
            className="bg-brown-50 rounded-2xl p-4 flex-row items-start mt-4 mb-4"
          >
            <View
              className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 mt-0.5 ${
                !formData.hasInsurance ? 'bg-brown-400 border-brown-400' : 'border-neutral-300'
              }`}
            >
              {!formData.hasInsurance && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900 mb-1">
                Je n'ai pas d'assurance maladie
              </Text>
              <Text className="text-sm text-neutral-600 leading-5">
                Vous pourrez ajouter ces informations ultérieurement dans votre profil.
              </Text>
            </View>
          </TouchableOpacity>

          {formData.hasInsurance && (
            <>
              <View className="bg-brown-400 rounded-3xl p-6 mt-4 mb-4">
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-xs text-brown-100 mb-1">FOURNISSEUR D'ASSURANCE</Text>
                    <Text className="text-2xl font-bold text-white">NHIS Ghana</Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    <Ionicons name="shield-checkmark" size={24} color="white" />
                  </View>
                </View>

                <View className="mt-8">
                  <Text className="text-xs text-brown-100 mb-2">NUMÉRO DE CARTE</Text>
                  <Text className="text-lg text-white tracking-wider">•••• •••• •••• ••••</Text>
                </View>
              </View>

              <Input
                label="Numéro NHIS"
                placeholder="Ex: GH-123456789"
                value={formData.nhisNumber}
                onChangeText={(text) => updateFormData({ nhisNumber: text })}
                rightIcon={<Ionicons name="card-outline" size={20} color={colors.neutral[400]} />}
              />

              <Text className="text-sm font-medium text-brown-700 mb-3">
                Photo de la carte (Recto/Verso)
              </Text>
              <View className="flex-row space-x-3 mb-4">
                <TouchableOpacity
                  onPress={() => pickImage('front')}
                  className="flex-1 h-32 border-2 border-dashed border-brown-300 rounded-2xl items-center justify-center bg-brown-50 overflow-hidden"
                >
                  {formData.cardFrontImage ? (
                    <Image
                      source={{ uri: formData.cardFrontImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera-outline" size={32} color={colors.brown[400]} />
                      <Text className="text-sm text-brown-600 mt-2">Recto</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => pickImage('back')}
                  className="flex-1 h-32 border-2 border-dashed border-brown-300 rounded-2xl items-center justify-center bg-brown-50 overflow-hidden"
                >
                  {formData.cardBackImage ? (
                    <Image
                      source={{ uri: formData.cardBackImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      <Ionicons name="camera-outline" size={32} color={colors.brown[400]} />
                      <Text className="text-sm text-brown-600 mt-2">Verso</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          <View className="space-y-3 mt-6">
            <TouchableOpacity
              onPress={handlePrevious}
              className="h-11 bg-transparent items-center justify-center rounded-md border-2 border-brown-400"
            >
              <Text className="text-brown-700 font-semibold text-base">Précédent</Text>
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
