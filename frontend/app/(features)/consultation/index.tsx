import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialty: string
  rating: number
  reviewCount: number
  consultationFee: number
  available: boolean
}

export default function ConsultationScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)

  const specialties = [
    { id: 'ALL', name: 'Tous', icon: 'grid' as const },
    { id: 'GENERAL', name: 'Médecin généraliste', icon: 'medical' as const },
    { id: 'CARDIOLOGIST', name: 'Cardiologue', icon: 'heart' as const },
    { id: 'DERMATOLOGIST', name: 'Dermatologue', icon: 'body' as const },
    { id: 'PEDIATRICIAN', name: 'Pédiatre', icon: 'people' as const },
  ]

  const loadDoctors = async () => {
    try {
      setDoctors([
        {
          id: '1',
          firstName: 'Dr. Kwame',
          lastName: 'Mensah',
          specialty: 'Médecin généraliste',
          rating: 4.8,
          reviewCount: 156,
          consultationFee: 50,
          available: true,
        },
        {
          id: '2',
          firstName: 'Dr. Aisha',
          lastName: 'Diallo',
          specialty: 'Cardiologue',
          rating: 4.9,
          reviewCount: 203,
          consultationFee: 75,
          available: true,
        },
        {
          id: '3',
          firstName: 'Dr. Samuel',
          lastName: 'Owusu',
          specialty: 'Pédiatre',
          rating: 4.7,
          reviewCount: 98,
          consultationFee: 60,
          available: false,
        },
      ])
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDoctors()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadDoctors()
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty =
      !selectedSpecialty || selectedSpecialty === 'ALL' || doctor.specialty === selectedSpecialty

    return matchesSearch && matchesSpecialty
  })

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Consultation</Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <View className="bg-white rounded-lg flex-row items-center px-4 py-3 mb-4 border border-neutral-200">
          <Ionicons name="search" size={20} color={colors.neutral[400]} />
          <TextInput
            className="flex-1 ml-2 text-base text-neutral-700"
            placeholder="Rechercher un médecin..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty.id}
                onPress={() => setSelectedSpecialty(specialty.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  selectedSpecialty === specialty.id || (!selectedSpecialty && specialty.id === 'ALL')
                    ? 'bg-brown-400'
                    : 'bg-white border border-neutral-200'
                }`}
              >
                <Ionicons
                  name={specialty.icon}
                  size={16}
                  color={
                    selectedSpecialty === specialty.id || (!selectedSpecialty && specialty.id === 'ALL')
                      ? 'white'
                      : colors.neutral[600]
                  }
                />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    selectedSpecialty === specialty.id || (!selectedSpecialty && specialty.id === 'ALL')
                      ? 'text-white'
                      : 'text-neutral-600'
                  }`}
                >
                  {specialty.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pb-6">
          {filteredDoctors.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="person-outline" size={64} color={colors.neutral[300]} />
              <Text className="text-neutral-500 mt-4">Aucun médecin trouvé</Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} variant="elevated">
                  <View className="flex-row items-center mb-3">
                    <View className="w-16 h-16 bg-brown-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-2xl">
                        {doctor.firstName[0]}{doctor.lastName[0]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-brown-700">
                        {doctor.firstName} {doctor.lastName}
                      </Text>
                      <Text className="text-sm text-neutral-600">{doctor.specialty}</Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="star" size={14} color={colors.warning} />
                        <Text className="text-sm text-neutral-600 ml-1">
                          {doctor.rating} ({doctor.reviewCount} avis)
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        doctor.available ? 'bg-success/10' : 'bg-neutral-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          doctor.available ? 'text-success' : 'text-neutral-500'
                        }`}
                      >
                        {doctor.available ? 'Disponible' : 'Indisponible'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
                    <View className="flex-row items-center">
                      <Ionicons name="cash-outline" size={16} color={colors.neutral[600]} />
                      <Text className="text-sm text-neutral-600 ml-1">
                        {doctor.consultationFee} GHS
                      </Text>
                    </View>
                    <Button
                      variant={doctor.available ? 'primary' : 'outline'}
                      size="sm"
                      disabled={!doctor.available}
                      onPress={() => router.push(`/(features)/consultation/${doctor.id}` as any)}
                    >
                      Réserver
                    </Button>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
