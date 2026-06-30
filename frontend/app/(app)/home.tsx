import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { usersApi } from '@/api/users.api'
import { vitalsApi } from '@/api/vitals.api'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'
import type { VitalSign } from '@/types/api.types'

export default function HomeScreen() {
  const { user, setUser } = useAuth()
  const [vitals, setVitals] = useState<Record<string, VitalSign | null>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [userData, vitalsData] = await Promise.all([
        usersApi.getMe(),
        vitalsApi.getLatest(),
      ])
      setUser(userData)
      setVitals(vitalsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const services = [
    {
      id: '1',
      title: 'Consultation',
      icon: 'videocam' as const,
      color: colors.blue[400],
      route: '/(features)/consultation',
    },
    {
      id: '2',
      title: 'Monitoring',
      icon: 'fitness' as const,
      color: colors.success,
      route: '/(features)/monitoring',
    },
    {
      id: '3',
      title: 'Dossiers',
      icon: 'folder' as const,
      color: colors.warning,
      route: '/(features)/records',
    },
    {
      id: '4',
      title: 'Médicaments',
      icon: 'medical' as const,
      color: colors.danger,
      route: '/(features)/medications',
    },
    {
      id: '5',
      title: 'PharmFind',
      icon: 'location' as const,
      color: colors.info,
      route: '/(features)/pharmfind',
    },
    {
      id: '6',
      title: 'Livraison',
      icon: 'bicycle' as const,
      color: colors.brown[500],
      route: '/(features)/delivery',
    },
    {
      id: '7',
      title: 'Assurance',
      icon: 'shield-checkmark' as const,
      color: colors.blue[600],
      route: '/(features)/insurance',
    },
  ]

  const getCountryFlag = (country: string) => {
    return country === 'GH' ? '🇬🇭' : '🇬🇳'
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-sm text-neutral-600">Bonjour,</Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-brown-700">
                  {user?.firstName || 'Utilisateur'}
                </Text>
                <Text className="text-2xl ml-2">
                  {user?.country && getCountryFlag(user.country)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')}
              className="w-12 h-12 bg-brown-100 rounded-full items-center justify-center"
            >
              <Ionicons name="notifications" size={24} color={colors.brown[400]} />
            </TouchableOpacity>
          </View>

          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-semibold text-brown-700 mb-3">
              Mes Constantes
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {vitals.HEART_RATE && (
                <View className="bg-success/10 px-3 py-2 rounded-md flex-row items-center">
                  <Ionicons name="heart" size={16} color={colors.success} />
                  <Text className="text-sm font-medium text-success ml-1">
                    {(vitals.HEART_RATE.valueJson as any).value} bpm
                  </Text>
                </View>
              )}
              {vitals.BLOOD_PRESSURE && (
                <View className="bg-danger/10 px-3 py-2 rounded-md flex-row items-center">
                  <Ionicons name="pulse" size={16} color={colors.danger} />
                  <Text className="text-sm font-medium text-danger ml-1">
                    {(vitals.BLOOD_PRESSURE.valueJson as any).systolic}/
                    {(vitals.BLOOD_PRESSURE.valueJson as any).diastolic}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => router.push('/(features)/monitoring' as any)}
                className="bg-brown-100 px-3 py-2 rounded-md flex-row items-center"
              >
                <Text className="text-sm font-medium text-brown-700">Voir plus</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.brown[700]} className="ml-1" />
              </TouchableOpacity>
            </View>
          </Card>

          <Text className="text-lg font-semibold text-brown-700 mb-3">
            Services
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => router.push(service.route as any)}
                className="w-[31%]"
              >
                <Card variant="elevated" padding="none">
                  <View className="items-center py-4">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <Ionicons
                        name={service.icon}
                        size={24}
                        color={service.color}
                      />
                    </View>
                    <Text className="text-xs font-medium text-neutral-700 text-center">
                      {service.title}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}