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

interface MedicalRecord {
  id: string
  type: 'PRESCRIPTION' | 'LAB_RESULT' | 'IMAGING' | 'CONSULTATION_NOTE' | 'OTHER'
  title: string
  date: string
  doctor?: string
  fileCount: number
}

export default function RecordsScreen() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const recordTypes = [
    { id: null, name: 'Tous', icon: 'grid' as const },
    { id: 'PRESCRIPTION', name: 'Ordonnances', icon: 'document-text' as const },
    { id: 'LAB_RESULT', name: 'Analyses', icon: 'flask' as const },
    { id: 'IMAGING', name: 'Imagerie', icon: 'image' as const },
    { id: 'CONSULTATION_NOTE', name: 'Consultations', icon: 'medical' as const },
  ]

  const loadRecords = async () => {
    try {
      setRecords([
        {
          id: '1',
          type: 'PRESCRIPTION',
          title: 'Ordonnance - Infection respiratoire',
          date: '2024-01-20',
          doctor: 'Dr. Kwame Mensah',
          fileCount: 1,
        },
        {
          id: '2',
          type: 'LAB_RESULT',
          title: 'Résultats de bilan sanguin',
          date: '2024-01-18',
          doctor: 'Laboratoire Central',
          fileCount: 3,
        },
        {
          id: '3',
          type: 'IMAGING',
          title: 'Radiographie thoracique',
          date: '2024-01-15',
          doctor: 'Centre d\'imagerie médicale',
          fileCount: 2,
        },
        {
          id: '4',
          type: 'CONSULTATION_NOTE',
          title: 'Note de consultation - Suivi cardiaque',
          date: '2024-01-10',
          doctor: 'Dr. Aisha Diallo',
          fileCount: 1,
        },
      ])
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadRecords()
  }

  const getRecordIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'PRESCRIPTION':
        return { name: 'document-text' as const, color: colors.blue[400] }
      case 'LAB_RESULT':
        return { name: 'flask' as const, color: colors.success }
      case 'IMAGING':
        return { name: 'image' as const, color: colors.info }
      case 'CONSULTATION_NOTE':
        return { name: 'medical' as const, color: colors.danger }
      default:
        return { name: 'document' as const, color: colors.neutral[500] }
    }
  }

  const filteredRecords = filter
    ? records.filter((record) => record.type === filter)
    : records

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-6 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.brown[700]} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-brown-700">Dossiers Médicaux</Text>
      </View>

      <View className="px-6 pt-4 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {recordTypes.map((type) => (
              <TouchableOpacity
                key={type.id || 'all'}
                onPress={() => setFilter(type.id)}
                className={`px-4 py-2 rounded-full flex-row items-center ${
                  filter === type.id ? 'bg-brown-400' : 'bg-white border border-neutral-200'
                }`}
              >
                <Ionicons
                  name={type.icon}
                  size={16}
                  color={filter === type.id ? 'white' : colors.neutral[600]}
                />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    filter === type.id ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {type.name}
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
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.push('/(features)/records/add' as any)}
            className="mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="ml-2 font-semibold text-white">Ajouter un document</Text>
            </View>
          </Button>

          {filteredRecords.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="folder-outline" size={64} color={colors.neutral[300]} />
              <Text className="text-neutral-500 mt-4">Aucun dossier</Text>
            </View>
          ) : (
            <View className="gap-4">
              {filteredRecords.map((record) => {
                const icon = getRecordIcon(record.type)
                return (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() => router.push(`/(features)/records/${record.id}` as any)}
                  >
                    <Card variant="elevated">
                      <View className="flex-row items-start mb-3">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${icon.color}20` }}
                        >
                          <Ionicons name={icon.name} size={24} color={icon.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-brown-700 mb-1">
                            {record.title}
                          </Text>
                          {record.doctor && (
                            <View className="flex-row items-center mb-1">
                              <Ionicons
                                name="person-outline"
                                size={14}
                                color={colors.neutral[500]}
                              />
                              <Text className="text-sm text-neutral-600 ml-1">
                                {record.doctor}
                              </Text>
                            </View>
                          )}
                          <View className="flex-row items-center">
                            <Ionicons
                              name="calendar-outline"
                              size={14}
                              color={colors.neutral[500]}
                            />
                            <Text className="text-xs text-neutral-500 ml-1">
                              {new Date(record.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </Text>
                          </View>
                        </View>
                        <View className="bg-neutral-100 px-2 py-1 rounded-full">
                          <Text className="text-xs text-neutral-600">
                            {record.fileCount} {record.fileCount > 1 ? 'fichiers' : 'fichier'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-end pt-3 border-t border-neutral-100">
                        <TouchableOpacity className="flex-row items-center">
                          <Ionicons name="download-outline" size={16} color={colors.brown[400]} />
                          <Text className="text-sm font-medium text-brown-400 ml-1">
                            Télécharger
                          </Text>
                        </TouchableOpacity>
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