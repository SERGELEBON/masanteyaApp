import { useState, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

const { width } = Dimensions.get('window')

const slides = [
  {
    id: '1',
    title: "L'Excellence Médicale\nAccessible",
    description: 'Une plateforme conçue pour le paysage de santé ouest-africain, alliant technologie moderne et chaleur humaine.',
    icon: 'medical' as const,
  },
  {
    id: '2',
    title: 'Consultations\nVidéo 24/7',
    description: 'Connectez-vous avec des médecins qualifiés à tout moment, depuis le confort de votre maison.',
    icon: 'videocam' as const,
  },
  {
    id: '3',
    title: 'Trouvez Votre\nPharmacie',
    description: 'Localisez les pharmacies à proximité, vérifiez la disponibilité des médicaments et commandez en ligne.',
    icon: 'medkit' as const,
  },
]

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
      setCurrentIndex(currentIndex + 1)
    } else {
      router.replace('/(auth)/login')
    }
  }

  const handleSkip = () => {
    router.replace('/(auth)/login')
  }

  const renderItem = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-6">
      <View className="bg-brown-100 w-32 h-32 rounded-full items-center justify-center mb-8">
        <Ionicons name={item.icon} size={64} color={colors.brown[400]} />
      </View>
      <Text className="text-3xl font-bold text-brown-700 text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-base text-neutral-600 text-center px-4">
        {item.description}
      </Text>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          className="absolute top-4 right-4 z-10 px-4 py-2"
        >
          <Text className="text-brown-400 font-semibold">Passer</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        keyExtractor={(item) => item.id}
      />

      <View className="px-6 pb-8">
        <View className="flex-row justify-center mb-6">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${
                index === currentIndex ? 'w-8 bg-brown-400' : 'w-2 bg-neutral-200'
              }`}
            />
          ))}
        </View>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        >
          {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Button>

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="mt-4"
          >
            <Text className="text-center text-brown-400 font-semibold">
              J'ai déjà un compte
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}
