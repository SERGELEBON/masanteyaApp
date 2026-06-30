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

interface Order {
  id: string
  orderNumber: string
  pharmacy: string
  items: number
  total: number
  status: 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
  estimatedDelivery?: string
}

export default function DeliveryScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'active' | 'completed'>('active')

  const loadOrders = async () => {
    try {
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          pharmacy: 'Pharmacie Centrale',
          items: 3,
          total: 125.5,
          status: 'IN_TRANSIT',
          createdAt: '2024-01-20T10:30:00Z',
          estimatedDelivery: '2024-01-20T16:00:00Z',
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          pharmacy: 'Pharmacie de la Gare',
          items: 2,
          total: 85.0,
          status: 'CONFIRMED',
          createdAt: '2024-01-19T14:20:00Z',
          estimatedDelivery: '2024-01-21T12:00:00Z',
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          pharmacy: 'Pharmacie du Marché',
          items: 5,
          total: 210.0,
          status: 'DELIVERED',
          createdAt: '2024-01-18T09:15:00Z',
        },
      ])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadOrders()
  }

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente', color: colors.warning, icon: 'time' as const }
      case 'CONFIRMED':
        return { label: 'Confirmée', color: colors.info, icon: 'checkmark-circle' as const }
      case 'IN_TRANSIT':
        return { label: 'En livraison', color: colors.blue[400], icon: 'bicycle' as const }
      case 'DELIVERED':
        return { label: 'Livrée', color: colors.success, icon: 'checkmark-done' as const }
      case 'CANCELLED':
        return { label: 'Annulée', color: colors.danger, icon: 'close-circle' as const }
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['PENDING', 'CONFIRMED', 'IN_TRANSIT'].includes(order.status)
    }
    return ['DELIVERED', 'CANCELLED'].includes(order.status)
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Livraison</Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <View className="flex-row gap-2 mb-4">
          {[
            { key: 'active' as const, label: 'En cours' },
            { key: 'completed' as const, label: 'Historique' },
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
            onPress={() => router.push('/(features)/delivery/pharmacies' as any)}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="cart" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Nouvelle commande</Text>
            </View>
          </Button>

          {filteredOrders.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="bicycle-outline" size={64} color={colors.neutral[300]} />
              <Text className="text-neutral-500 mt-4">Aucune commande</Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                return (
                  <TouchableOpacity
                    key={order.id}
                    onPress={() => router.push(`/(features)/delivery/${order.id}` as any)}
                  >
                    <Card variant="elevated">
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-brown-700 mb-1">
                            {order.orderNumber}
                          </Text>
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="storefront-outline" size={14} color={colors.neutral[500]} />
                            <Text className="text-sm text-neutral-600 ml-1">
                              {order.pharmacy}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={14} color={colors.neutral[500]} />
                            <Text className="text-xs text-neutral-500 ml-1">
                              {formatDate(order.createdAt)}
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

                      {order.estimatedDelivery && order.status !== 'DELIVERED' && (
                        <View className="bg-blue-50 px-3 py-2 rounded-lg mb-3">
                          <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color={colors.blue[400]} />
                            <Text className="text-sm text-blue-700 ml-2">
                              Livraison estimée: {formatDate(order.estimatedDelivery)}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
                        <View>
                          <Text className="text-xs text-neutral-500 mb-1">
                            {order.items} article{order.items > 1 ? 's' : ''}
                          </Text>
                          <Text className="text-lg font-bold text-brown-700">
                            {order.total.toFixed(2)} GHS
                          </Text>
                        </View>
                        {order.status === 'IN_TRANSIT' && (
                          <Button variant="outline" size="sm">
                            <View className="flex-row items-center">
                              <Ionicons name="location" size={16} color={colors.brown[700]} />
                              <Text className="ml-1 font-semibold text-brown-700">Suivre</Text>
                            </View>
                          </Button>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
