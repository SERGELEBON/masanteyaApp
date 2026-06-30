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
import { vitalsApi } from '@/api/vitals.api'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { VitalSign } from '@/types/api.types'
import Toast from 'react-native-toast-message'

export default function MonitoringScreen() {
  const [vitals, setVitals] = useState<Record<string, VitalSign | null>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadVitals = async () => {
    try {
      const data = await vitalsApi.getLatest()
      setVitals(data)
    } catch (error) {
      console.error('Error loading vitals:', error)
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de charger les données',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadVitals()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadVitals()
  }

  const vitalCards = [
    {
      id: 'HEART_RATE',
      title: 'Fréquence Cardiaque',
      icon: 'heart' as const,
      color: colors.danger,
      unit: 'bpm',
      getValue: (vital: VitalSign | null) => vital ? (vital.valueJson as any).value : null,
    },
    {
      id: 'BLOOD_PRESSURE',
      title: 'Tension Artérielle',
      icon: 'pulse' as const,
      color: colors.blue[400],
      unit: 'mmHg',
      getValue: (vital: VitalSign | null) =>
        vital ? `${(vital.valueJson as any).systolic}/${(vital.valueJson as any).diastolic}` : null,
    },
    {
      id: 'TEMPERATURE',
      title: 'Température',
      icon: 'thermometer' as const,
      color: colors.warning,
      unit: '°C',
      getValue: (vital: VitalSign | null) => vital ? (vital.valueJson as any).value : null,
    },
    {
      id: 'OXYGEN_SATURATION',
      title: 'Saturation en O₂',
      icon: 'water' as const,
      color: colors.info,
      unit: '%',
      getValue: (vital: VitalSign | null) => vital ? (vital.valueJson as any).value : null,
    },
    {
      id: 'BLOOD_GLUCOSE',
      title: 'Glycémie',
      icon: 'analytics' as const,
      color: colors.brown[500],
      unit: 'mg/dL',
      getValue: (vital: VitalSign | null) => vital ? (vital.valueJson as any).value : null,
    },
    {
      id: 'WEIGHT',
      title: 'Poids',
      icon: 'fitness' as const,
      color: colors.success,
      unit: 'kg',
      getValue: (vital: VitalSign | null) => vital ? (vital.valueJson as any).value : null,
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Mes Constantes</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.push('/(features)/monitoring/add' as any)}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Ajouter une mesure</Text>
            </View>
          </Button>

          <View className="flex-row flex-wrap gap-3">
            {vitalCards.map((card) => {
              const vital = vitals[card.id]
              const value = card.getValue(vital)

              return (
                <TouchableOpacity
                  key={card.id}
                  onPress={() => router.push(`/(features)/monitoring/${card.id.toLowerCase()}` as any)}
                  className="w-[48%]"
                >
                  <Card variant="elevated">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-3"
                      style={{ backgroundColor: `${card.color}20` }}
                    >
                      <Ionicons name={card.icon} size={24} color={card.color} />
                    </View>
                    <Text className="text-xs text-neutral-600 mb-1">
                      {card.title}
                    </Text>
                    {value ? (
                      <>
                        <Text className="text-2xl font-bold text-brown-700 mb-1">
                          {value}
                        </Text>
                        <Text className="text-xs text-neutral-500">{card.unit}</Text>
                        {vital?.recordedAt && (
                          <Text className="text-xs text-neutral-400 mt-2">
                            {formatDate(vital.recordedAt)}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text className="text-sm text-neutral-400">Aucune donnée</Text>
                    )}
                  </Card>
                </TouchableOpacity>
              )
            })}
          </View>

          <View className="mt-6">
            <Text className="text-lg font-semibold text-brown-700 mb-3">
              Historique
            </Text>
            <Card variant="elevated">
              <View className="items-center py-8">
                <Ionicons name="bar-chart-outline" size={48} color={colors.neutral[300]} />
                <Text className="text-neutral-500 mt-2">
                  Consultez votre historique détaillé
                </Text>
                <TouchableOpacity className="mt-4">
                  <Text className="text-brown-400 font-semibold">Voir tout</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
