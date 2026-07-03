import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native'
import type { Country } from '@/types/api.types'

interface CountryPickerProps {
  value: Country | null
  onChange: (value: Country) => void
}

interface CountryOption {
  code: Country
  name: string
  flag: string
  dialCode: string
}

const countries: CountryOption[] = [
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224' },
]

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [isVisible, setIsVisible] = useState(false)

  const selectedCountry = countries.find((c) => c.code === value)

  const handleSelect = (country: CountryOption) => {
    onChange(country.code)
    setIsVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className={`flex-1 h-14 rounded-xl px-4 flex-row items-center justify-between ${
          value ? 'bg-brown-400' : 'bg-white border border-brown-200'
        }`}
      >
        {selectedCountry ? (
          <View className="flex-row items-center">
            <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
            <Text className="text-white font-medium">{selectedCountry.name}</Text>
          </View>
        ) : (
          <Text className="text-gray-400">Pays</Text>
        )}
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

            <Text className="text-xl font-bold text-gray-800 mb-6">
              Pays de résidence
            </Text>

            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => handleSelect(country)}
                className="flex-row items-center py-4 border-b border-gray-100"
              >
                <Text className="text-3xl mr-4">{country.flag}</Text>
                <Text className="text-base text-gray-800 flex-1">{country.name}</Text>
                <Text className="text-gray-500">{country.dialCode}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="h-14 bg-transparent items-center justify-center rounded-2xl border-2 border-brown-200 mt-6"
            >
              <Text className="text-brown-600 font-semibold text-base">Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

export function getDialCodeForCountry(country: Country | null): string {
  const countryOption = countries.find((c) => c.code === country)
  return countryOption?.dialCode || '+233'
}