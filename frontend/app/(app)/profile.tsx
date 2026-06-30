import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const getCountryFlag = (country: string) => {
    return country === 'GH' ? '🇬🇭' : '🇬🇳'
  }

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            await logout()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  const menuItems = [
    {
      id: '1',
      title: 'Modifier le profil',
      icon: 'person-outline' as const,
      color: colors.brown[400],
      onPress: () => {},
    },
    {
      id: '2',
      title: 'Paramètres de compte',
      icon: 'settings-outline' as const,
      color: colors.neutral[600],
      onPress: () => {},
    },
    {
      id: '3',
      title: 'Sécurité',
      icon: 'lock-closed-outline' as const,
      color: colors.info,
      onPress: () => {},
    },
    {
      id: '4',
      title: 'Notifications',
      icon: 'notifications-outline' as const,
      color: colors.warning,
      onPress: () => {},
    },
    {
      id: '5',
      title: 'Aide et support',
      icon: 'help-circle-outline' as const,
      color: colors.success,
      onPress: () => {},
    },
    {
      id: '6',
      title: 'Confidentialité',
      icon: 'shield-outline' as const,
      color: colors.blue[400],
      onPress: () => {},
    },
    {
      id: '7',
      title: 'À propos',
      icon: 'information-circle-outline' as const,
      color: colors.neutral[500],
      onPress: () => {},
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView>
        <View className="p-6">
          <Text className="text-2xl font-bold text-brown-700 mb-6">Profil</Text>

          <Card variant="elevated" className="mb-6">
            <View className="items-center">
              <View className="w-24 h-24 bg-brown-100 rounded-full items-center justify-center mb-4">
                <Text className="text-4xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Text className="text-xl font-bold text-brown-700">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-2xl ml-2">
                  {user?.country && getCountryFlag(user.country)}
                </Text>
              </View>
              <Text className="text-sm text-neutral-600 mb-1">{user?.email}</Text>
              <Text className="text-sm text-neutral-600">{user?.phone}</Text>

              <View className="flex-row gap-2 mt-4">
                <View className="bg-brown-50 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-brown-700">
                    {user?.role === 'PATIENT' ? 'Patient' : user?.role}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  user?.verified ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  <Text className={`text-xs font-medium ${
                    user?.verified ? 'text-success' : 'text-warning'
                  }`}>
                    {user?.verified ? 'Vérifié' : 'Non vérifié'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          <Text className="text-lg font-semibold text-brown-700 mb-3">
            Paramètres
          </Text>
          <Card variant="elevated" padding="none" className="mb-6">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1 ? 'border-b border-neutral-100' : ''
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text className="flex-1 text-base text-neutral-700">
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            ))}
          </Card>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text className="ml-2 font-semibold text-danger">Déconnexion</Text>
            </View>
          </Button>

          <Text className="text-center text-xs text-neutral-500 mt-6">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
