import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  taken: boolean
  nextDose?: string
}

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const loadMedications = async () => {
    try {
      setMedications([
        {
          id: '1',
          name: 'Paracétamol',
          dosage: '500mg',
          frequency: '3 fois par jour',
          startDate: '2024-01-15',
          endDate: '2024-01-22',
          taken: false,
          nextDose: '14:00',
        },
        {
          id: '2',
          name: 'Amoxicilline',
          dosage: '250mg',
          frequency: '2 fois par jour',
          startDate: '2024-01-14',
          endDate: '2024-01-21',
          taken: true,
          nextDose: '20:00',
        },
        {
          id: '3',
          name: 'Vitamine C',
          dosage: '1000mg',
          frequency: '1 fois par jour',
          startDate: '2024-01-10',
          endDate: '2024-02-10',
          taken: false,
          nextDose: '08:00',
        },
      ])
    } catch (error) {
      console.error('Error loading medications:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadMedications()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadMedications()
  }

  const markAsTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: true } : med))
    )
  }

  const filteredMedications = medications.filter((med) => {
    const now = new Date()
    const endDate = new Date(med.endDate)
    const isActive = endDate >= now

    if (filter === 'active') return isActive
    if (filter === 'completed') return !isActive
    return true
  })

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Médicaments</Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <View className="flex-row gap-2 mb-4">
          {[
            { key: 'active' as const, label: 'En cours' },
            { key: 'all' as const, label: 'Tous' },
            { key: 'completed' as const, label: 'Terminés' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              className={`flex-1 py-2 rounded-lg ${
                filter === tab.key ? 'bg-brown-400' : 'bg-white border border-neutral-200'
              }`}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  filter === tab.key ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pb-6">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.push('/(features)/medications/add' as any)}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Ajouter un médicament</Text>
            </View>
          </Button>

          {filteredMedications.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="medical-outline" size={64} color={colors.neutral[300]} />
              <Text className="text-neutral-500 mt-4">Aucun médicament</Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredMedications.map((medication) => (
                <Card key={medication.id} variant="elevated">
                  <View className="flex-row items-start mb-3">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${colors.danger}20` }}
                    >
                      <Ionicons name="medical" size={24} color={colors.danger} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-brown-700 mb-1">
                        {medication.name}
                      </Text>
                      <Text className="text-sm text-neutral-600 mb-1">
                        {medication.dosage} • {medication.frequency}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                        <Text className="text-xs text-neutral-500 ml-1">
                          {new Date(medication.startDate).toLocaleDateString('fr-FR')} -{' '}
                          {new Date(medication.endDate).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {medication.nextDose && (
                    <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color={colors.neutral[600]} />
                        <Text className="text-sm text-neutral-600 ml-1">
                          Prochaine prise: {medication.nextDose}
                        </Text>
                      </View>
                      {!medication.taken && (
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => markAsTaken(medication.id)}
                        >
                          Marquer pris
                        </Button>
                      )}
                      {medication.taken && (
                        <View className="bg-success/10 px-3 py-1 rounded-full">
                          <Text className="text-xs font-medium text-success">Pris</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
