import React from 'react'
import { View, Text } from 'react-native'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
}

export function ProgressBar({ currentStep, totalSteps, stepLabel }: ProgressBarProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-neutral-600">
          Étape {currentStep} sur {totalSteps}
        </Text>
        <Text className="text-sm text-neutral-600">{stepLabel}</Text>
      </View>
      <View className="flex-row">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={`flex-1 h-1 rounded-full ${
              index < currentStep ? 'bg-brown-400' : 'bg-neutral-200'
            } ${index > 0 ? 'ml-2' : ''}`}
          />
        ))}
      </View>
    </View>
  )
}
