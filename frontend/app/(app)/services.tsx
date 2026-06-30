import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/ui/Card'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

export default function ServicesScreen() {
  const services = [
    {
      id: '1',
      title: 'Consultation',
      description: 'Consultez un médecin en ligne',
      icon: 'videocam' as const,
      color: colors.blue[400],
      route: '/(features)/consultation',
    },
    {
      id: '2',
      title: 'Monitoring',
      description: 'Suivez vos constantes vitales',
      icon: 'fitness' as const,
      color: colors.success,
      route: '/(features)/monitoring',
    },
    {
      id: '3',
      title: 'Dossiers Médicaux',
      description: 'Accédez à vos dossiers',
      icon: 'folder' as const,
      color: colors.warning,
      route: '/(features)/records',
    },
    {
      id: '4',
      title: 'Médicaments',
      description: 'Gérez vos médicaments',
      icon: 'medical' as const,
      color: colors.danger,
      route: '/(features)/medications',
    },
    {
      id: '5',
      title: 'PharmFind',
      description: 'Trouvez une pharmacie proche',
      icon: 'location' as const,
      color: colors.info,
      route: '/(features)/pharmfind',
    },
    {
      id: '6',
      title: 'Livraison',
      description: 'Commandez vos médicaments',
      icon: 'bicycle' as const,
      color: colors.brown[500],
      route: '/(features)/delivery',
    },
    {
      id: '7',
      title: 'Assurance',
      description: 'Gérez votre assurance santé',
      icon: 'shield-checkmark' as const,
      color: colors.blue[600],
      route: '/(features)/insurance',
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView>
        <View className="p-6">
          <Text className="text-2xl font-bold text-brown-700 mb-2">Services</Text>
          <Text className="text-base text-neutral-600 mb-6">
            Accédez à tous nos services de santé
          </Text>

          <View className="gap-4">
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                onPress={() => router.push(service.route as any)}
              >
                <Card variant="elevated">
                  <View className="flex-row items-center">
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${service.color}20` }}
                    >
                      <Ionicons
                        name={service.icon}
                        size={28}
                        color={service.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-brown-700 mb-1">
                        {service.title}
                      </Text>
                      <Text className="text-sm text-neutral-600">
                        {service.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={colors.neutral[400]}
                    />
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
