import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Linking,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'

interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  distance: number
  isOpen: boolean
  latitude: number
  longitude: number
  hours: string
}

const { height } = Dimensions.get('window')

export default function PharmFindScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)

  useEffect(() => {
    requestLocationPermission()
  }, [])

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission refusée',
          text2: 'Activez la localisation pour trouver des pharmacies',
        })
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation)
      loadNearbyPharmacies(currentLocation)
    } catch (error) {
      console.error('Error getting location:', error)
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de récupérer votre position',
      })
    }
  }

  const loadNearbyPharmacies = async (loc: Location.LocationObject) => {
    setLoading(true)
    try {
      setPharmacies([
        {
          id: '1',
          name: 'Pharmacie Centrale',
          address: '123 Independence Ave, Accra',
          phone: '+233 50 123 4567',
          distance: 0.5,
          isOpen: true,
          latitude: loc.coords.latitude + 0.005,
          longitude: loc.coords.longitude + 0.005,
          hours: '8h - 20h',
        },
        {
          id: '2',
          name: 'Pharmacie de la Gare',
          address: '45 Station Rd, Kumasi',
          phone: '+233 50 234 5678',
          distance: 1.2,
          isOpen: true,
          latitude: loc.coords.latitude - 0.01,
          longitude: loc.coords.longitude + 0.01,
          hours: '24h/24',
        },
        {
          id: '3',
          name: 'Pharmacie du Marché',
          address: '78 Market St, Tamale',
          phone: '+233 50 345 6789',
          distance: 2.8,
          isOpen: false,
          latitude: loc.coords.latitude + 0.02,
          longitude: loc.coords.longitude - 0.015,
          hours: '8h - 18h',
        },
      ])
    } catch (error) {
      console.error('Error loading pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }

  const openMaps = (pharmacy: Pharmacy) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`
    Linking.openURL(url)
  }

  const callPharmacy = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const filteredPharmacies = pharmacies.filter((pharmacy) =>
    pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">PharmFind</Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <View className="bg-white rounded-lg flex-row items-center px-4 py-3 mb-4 border border-neutral-200">
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            className="flex-1 ml-2 text-base text-neutral-700"
            placeholder="Rechercher une pharmacie..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={{ height: height * 0.3 }} className="bg-neutral-200 mb-4">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="map" size={64} color={colors.neutral[400]} />
          <Text className="text-neutral-500 mt-2">Carte interactive</Text>
          <Text className="text-xs text-neutral-400 mt-1">
            (Google Maps intégration)
          </Text>
        </View>
      </View>

      <View className="flex-1 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-brown-700">
            Pharmacies proches ({filteredPharmacies.length})
          </Text>
          <TouchableOpacity onPress={() => location && loadNearbyPharmacies(location)}>
            <Ionicons name="refresh" size={24} color={colors.brown[400]} />
          </TouchableOpacity>
        </View>

        {filteredPharmacies.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="location-outline" size={64} color={colors.neutral[300]} />
            <Text className="text-neutral-500 mt-4">Aucune pharmacie trouvée</Text>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {filteredPharmacies.map((pharmacy) => (
              <Card
                key={pharmacy.id}
                variant="elevated"
                className={selectedPharmacy?.id === pharmacy.id ? 'border-2 border-brown-400' : ''}
              >
                <TouchableOpacity onPress={() => setSelectedPharmacy(pharmacy)}>
                  <View className="flex-row items-start mb-3">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${colors.info}20` }}
                    >
                      <Ionicons name="medical" size={24} color={colors.info} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-lg font-semibold text-brown-700 flex-1">
                          {pharmacy.name}
                        </Text>
                        <View
                          className={`px-2 py-1 rounded-full ${
                            pharmacy.isOpen ? 'bg-success/10' : 'bg-neutral-200'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              pharmacy.isOpen ? 'text-success' : 'text-neutral-500'
                            }`}
                          >
                            {pharmacy.isOpen ? 'Ouvert' : 'Fermé'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                        <Text className="text-sm text-neutral-600 ml-1 flex-1">
                          {pharmacy.address}
                        </Text>
                      </View>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="navigate-outline" size={14} color={colors.neutral[500]} />
                        <Text className="text-sm text-neutral-600 ml-1">
                          {pharmacy.distance} km • {pharmacy.hours}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 pt-3 border-t border-neutral-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onPress={() => callPharmacy(pharmacy.phone)}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="call" size={16} color={colors.brown[700]} />
                        <Text className="ml-1 font-semibold text-brown-700">Appeler</Text>
                      </View>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onPress={() => openMaps(pharmacy)}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="navigate" size={16} color="white" />
                        <Text className="ml-1 font-semibold text-white">Itinéraire</Text>
                      </View>
                    </Button>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
