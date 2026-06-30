import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface Notification {
  id: string
  type: 'APPOINTMENT' | 'MEDICATION' | 'VITAL_ALERT' | 'DELIVERY' | 'SYSTEM'
  title: string
  message: string
  createdAt: string
  read: boolean
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadNotifications = async () => {
    setRefreshing(true)
    try {
      setNotifications([
        {
          id: '1',
          type: 'APPOINTMENT',
          title: 'Consultation demain',
          message: 'Vous avez une consultation avec Dr. Kofi à 14h00',
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'MEDICATION',
          title: 'Rappel de médicament',
          message: 'Il est temps de prendre votre Paracétamol',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'VITAL_ALERT',
          title: 'Alerte de santé',
          message: 'Votre tension artérielle est élevée',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          read: true,
        },
      ])
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'APPOINTMENT':
        return { name: 'calendar' as const, color: colors.blue[400] }
      case 'MEDICATION':
        return { name: 'medical' as const, color: colors.danger }
      case 'VITAL_ALERT':
        return { name: 'warning' as const, color: colors.warning }
      case 'DELIVERY':
        return { name: 'bicycle' as const, color: colors.brown[500] }
      default:
        return { name: 'information-circle' as const, color: colors.info }
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now.getTime() - notifDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    return `Il y a ${diffDays}j`
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-brown-700">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-danger px-2 py-1 rounded-full">
              <Text className="text-xs font-semibold text-white">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />
        }
      >
        <View className="px-6 pb-6">
          {notifications.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={colors.neutral[300]}
              />
              <Text className="text-neutral-500 mt-4">Aucune notification</Text>
            </View>
          ) : (
            <View className="gap-3">
              {notifications.map((notification) => {
                const icon = getNotificationIcon(notification.type)
                return (
                  <TouchableOpacity
                    key={notification.id}
                    onPress={() => markAsRead(notification.id)}
                  >
                    <Card
                      variant="elevated"
                      className={!notification.read ? 'border-l-4 border-brown-400' : ''}
                    >
                      <View className="flex-row items-start">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${icon.color}20` }}
                        >
                          <Ionicons name={icon.name} size={20} color={icon.color} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row justify-between items-start mb-1">
                            <Text
                              className={`text-base font-semibold ${
                                notification.read ? 'text-neutral-700' : 'text-brown-700'
                              }`}
                            >
                              {notification.title}
                            </Text>
                            {!notification.read && (
                              <View className="w-2 h-2 bg-brown-400 rounded-full ml-2" />
                            )}
                          </View>
                          <Text className="text-sm text-neutral-600 mb-2">
                            {notification.message}
                          </Text>
                          <Text className="text-xs text-neutral-500">
                            {formatTime(notification.createdAt)}
                          </Text>
                        </View>
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
