import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { BloodGroupPicker } from '@/components/ui/BloodGroupPicker'
import { ProgressBar } from '@/components/register/ProgressBar'
import { useRegisterStore } from '@/stores/register.store'
import { colors } from '@/theme/colors'

export default function RegisterIdentityScreen() {
  const { formData, updateFormData } = useRegisterStore()
  const [dateOfBirth, setDateOfBirth] = useState(formData.dateOfBirth)

  const pickImage = async () => {
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
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      updateFormData({ profileImage: result.assets[0].uri })
    }
  }

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    let formatted = cleaned

    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    }
    if (cleaned.length >= 4) {
      formatted =
        cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8)
    }

    return formatted.slice(0, 10)
  }

  const handleNext = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !dateOfBirth ||
      !formData.bloodGroup
    ) {
      Toast.show({
        type: 'error',
        text1: 'Champs requis',
        text2: 'Veuillez remplir tous les champs obligatoires',
      })
      return
    }

    updateFormData({ dateOfBirth })
    router.push('/(auth)/register/contact')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-brown-700">MaSanteYa</Text>
          </View>

          <ProgressBar currentStep={1} totalSteps={4} stepLabel="Identité" />

          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={pickImage}
              className="w-32 h-32 rounded-full border-2 border-dashed border-brown-300 bg-brown-50 items-center justify-center relative"
            >
              {formData.profileImage ? (
                <Image
                  source={{ uri: formData.profileImage }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Ionicons name="camera-outline" size={32} color={colors.brown[400]} />
              )}
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-brown-400 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="pencil" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-neutral-600 mt-3">
              Ajouter une photo de profil
            </Text>
          </View>

          <Input
            label="Prénom"
            placeholder="Ex: Koffi"
            value={formData.firstName}
            onChangeText={(text) => updateFormData({ firstName: text })}
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.neutral[400]} />}
          />

          <Input
            label="Nom de famille"
            placeholder="Ex: Diallo"
            value={formData.lastName}
            onChangeText={(text) => updateFormData({ lastName: text })}
            leftIcon={<Ionicons name="people-outline" size={20} color={colors.neutral[400]} />}
          />

          <Input
            label="Date de naissance"
            placeholder="mm/dd/yyyy"
            value={dateOfBirth}
            onChangeText={(text) => setDateOfBirth(formatDate(text))}
            keyboardType="numeric"
            maxLength={10}
            leftIcon={
              <Ionicons name="calendar-outline" size={20} color={colors.neutral[400]} />
            }
          />

          <Text className="text-sm font-medium text-brown-700 mb-2">
            Groupe Sanguin
          </Text>
          <BloodGroupPicker
            value={formData.bloodGroup}
            onChange={(value) => updateFormData({ bloodGroup: value })}
          />

          <View className="mt-8">
            <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
              Suivant
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}