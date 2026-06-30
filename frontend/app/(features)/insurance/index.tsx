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
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface InsuranceCard {
  id: string
  provider: 'NHIS' | 'NSIA'
  policyNumber: string
  memberName: string
  validUntil: string
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING'
  coverageType: string
}

interface Claim {
  id: string
  claimNumber: string
  date: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  description: string
}

export default function InsuranceScreen() {
  const { user } = useAuth()
  const [cards, setCards] = useState<InsuranceCard[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setCards([
        {
          id: '1',
          provider: user?.country === 'GH' ? 'NHIS' : 'NSIA',
          policyNumber: user?.country === 'GH' ? 'NHIS-2024-001234' : 'NSIA-GN-567890',
          memberName: `${user?.firstName} ${user?.lastName}`,
          validUntil: '2024-12-31',
          status: 'ACTIVE',
          coverageType: 'Standard',
        },
      ])

      setClaims([
        {
          id: '1',
          claimNumber: 'CLM-2024-001',
          date: '2024-01-15',
          amount: 150.0,
          status: 'APPROVED',
          description: 'Consultation médicale générale',
        },
        {
          id: '2',
          claimNumber: 'CLM-2024-002',
          date: '2024-01-18',
          amount: 85.5,
          status: 'PENDING',
          description: 'Analyses de laboratoire',
        },
      ])
    } catch (error) {
      console.error('Error loading insurance data:', error)
    } finally {
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

  const getProviderInfo = (provider: 'NHIS' | 'NSIA') => {
    if (provider === 'NHIS') {
      return {
        name: 'National Health Insurance Scheme',
        country: 'Ghana',
        flag: '🇬🇭',
        color: colors.success,
      }
    }
    return {
      name: 'NSIA Assurances',
      country: 'Guinée',
      flag: '🇬🇳',
      color: colors.blue[500],
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active', color: colors.success, icon: 'checkmark-circle' as const }
      case 'EXPIRED':
        return { label: 'Expirée', color: colors.danger, icon: 'close-circle' as const }
      case 'PENDING':
        return { label: 'En attente', color: colors.warning, icon: 'time' as const }
      case 'APPROVED':
        return { label: 'Approuvée', color: colors.success, icon: 'checkmark-done' as const }
      case 'REJECTED':
        return { label: 'Rejetée', color: colors.danger, icon: 'close' as const }
      default:
        return { label: status, color: colors.neutral[500], icon: 'information-circle' as const }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Assurance</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <Text className="text-lg font-semibold text-brown-700 mb-3">
            Mes Cartes d'Assurance
          </Text>

          {cards.length === 0 ? (
            <Card variant="elevated" className="mb-6">
              <View className="items-center py-8">
                <Ionicons name="shield-outline" size={64} color={colors.neutral[300]} />
                <Text className="text-neutral-500 mt-4 mb-4">
                  Aucune carte d'assurance
                </Text>
                <Button variant="primary" size="sm">
                  Ajouter une carte
                </Button>
              </View>
            </Card>
          ) : (
            <View className="gap-4 mb-6">
              {cards.map((card) => {
                const provider = getProviderInfo(card.provider)
                const statusInfo = getStatusInfo(card.status)
                return (
                  <Card
                    key={card.id}
                    variant="elevated"
                    className="overflow-hidden"
                  >
                    <View
                      className="h-40 p-4 rounded-lg"
                      style={{ backgroundColor: provider.color }}
                    >
                      <View className="flex-row justify-between items-start mb-4">
                        <View>
                          <Text className="text-white text-sm opacity-80 mb-1">
                            {provider.name}
                          </Text>
                          <Text className="text-white text-lg font-semibold">
                            {provider.country} {provider.flag}
                          </Text>
                        </View>
                        <Ionicons name="shield-checkmark" size={32} color="white" />
                      </View>

                      <View className="flex-1 justify-end">
                        <Text className="text-white text-xs opacity-80 mb-1">
                          Numéro de police
                        </Text>
                        <Text className="text-white text-xl font-bold tracking-wider mb-3">
                          {card.policyNumber}
                        </Text>

                        <View className="flex-row justify-between items-center">
                          <View>
                            <Text className="text-white text-xs opacity-80">Titulaire</Text>
                            <Text className="text-white font-semibold">
                              {card.memberName}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-white text-xs opacity-80">Valide jusqu'au</Text>
                            <Text className="text-white font-semibold">
                              {new Date(card.validUntil).toLocaleDateString('fr-FR', {
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-3">
                      <View
                        className="px-3 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: `${statusInfo.color}15` }}
                      >
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                        <Text
                          className="text-xs font-medium ml-1"
                          style={{ color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                      <Text className="text-sm text-neutral-600">
                        Type: {card.coverageType}
                      </Text>
                    </View>
                  </Card>
                )
              })}
            </View>
          )}

          <Text className="text-lg font-semibold text-brown-700 mb-3">
            Demandes de Remboursement
          </Text>

          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.push('/(features)/insurance/new-claim' as any)}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Nouvelle demande</Text>
            </View>
          </Button>

          {claims.length === 0 ? (
            <Card variant="elevated">
              <View className="items-center py-8">
                <Ionicons name="document-text-outline" size={64} color={colors.neutral[300]} />
                <Text className="text-neutral-500 mt-4">
                  Aucune demande de remboursement
                </Text>
              </View>
            </Card>
          ) : (
            <View className="gap-3">
              {claims.map((claim) => {
                const statusInfo = getStatusInfo(claim.status)
                return (
                  <Card key={claim.id} variant="elevated">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-brown-700 mb-1">
                          {claim.claimNumber}
                        </Text>
                        <Text className="text-sm text-neutral-600 mb-1">
                          {claim.description}
                        </Text>
                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                          <Text className="text-xs text-neutral-500 ml-1">
                            {new Date(claim.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: `${statusInfo.color}15` }}
                      >
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                        <Text
                          className="text-xs font-medium ml-1"
                          style={{ color: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
                      <Text className="text-lg font-bold text-brown-700">
                        {claim.amount.toFixed(2)} GHS
                      </Text>
                      <TouchableOpacity>
                        <Text className="text-sm font-medium text-brown-400">
                          Voir détails
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}