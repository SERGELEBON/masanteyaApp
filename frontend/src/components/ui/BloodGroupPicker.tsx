import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import type { BloodGroup } from '@/types/api.types'

interface BloodGroupPickerProps {
  value: BloodGroup | null
  onChange: (value: BloodGroup) => void
}

const bloodGroups: BloodGroup[] = [
  'A_POS',
  'A_NEG',
  'B_POS',
  'B_NEG',
  'AB_POS',
  'AB_NEG',
  'O_POS',
  'O_NEG',
]

const bloodGroupLabels: Record<BloodGroup, string> = {
  A_POS: 'A+',
  A_NEG: 'A-',
  B_POS: 'B+',
  B_NEG: 'B-',
  AB_POS: 'AB+',
  AB_NEG: 'AB-',
  O_POS: 'O+',
  O_NEG: 'O-',
}

export function BloodGroupPicker({ value, onChange }: BloodGroupPickerProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleSelect = (group: BloodGroup) => {
    onChange(group)
    setIsVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="h-14 border border-brown-200 rounded-xl px-4 flex-row items-center justify-between bg-white"
      >
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">🩸</Text>
          <Text className={value ? 'text-gray-800' : 'text-gray-400'}>
            {value ? bloodGroupLabels[value] : 'Choisir votre groupe'}
          </Text>
        </View>
        <Text className="text-brown-400">▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setIsVisible(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

            <Text className="text-xl font-bold text-gray-800 mb-2">Groupe Sanguin</Text>
            <Text className="text-sm text-gray-600 mb-6">
              Ces informations aident les médecins en cas d'urgence.
            </Text>

            <View className="flex-row flex-wrap justify-between mb-6">
              {bloodGroups.map((group) => (
                <TouchableOpacity
                  key={group}
                  onPress={() => handleSelect(group)}
                  className={`w-[23%] h-16 rounded-2xl items-center justify-center mb-3 border-2 ${
                    value === group
                      ? 'bg-brown-50 border-brown-400'
                      : 'bg-white border-brown-200'
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      value === group ? 'text-brown-600' : 'text-gray-700'
                    }`}
                  >
                    {bloodGroupLabels[group]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="h-14 bg-transparent items-center justify-center rounded-2xl border-2 border-brown-200"
            >
              <Text className="text-brown-600 font-semibold text-base">Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
