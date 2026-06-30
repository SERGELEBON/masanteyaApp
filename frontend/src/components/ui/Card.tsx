import React from 'react'
import { View, ViewProps } from 'react-native'
import { tokens } from '@/theme/tokens'

interface CardProps extends ViewProps {
  variant?: 'flat' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  children,
  style,
  ...props
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'flat':
        return 'bg-neutral-50'
      case 'elevated':
        return 'bg-white'
      case 'outlined':
        return 'bg-white border border-neutral-200'
    }
  }

  const getPaddingClasses = () => {
    switch (padding) {
      case 'none':
        return ''
      case 'sm':
        return 'p-3'
      case 'md':
        return 'p-4'
      case 'lg':
        return 'p-6'
    }
  }

  const elevationStyle = variant === 'elevated' ? tokens.shadow.md : {}

  return (
    <View
      className={`
        ${getVariantClasses()}
        ${getPaddingClasses()}
        rounded-lg
      `}
      style={[elevationStyle, style]}
      {...props}
    >
      {children}
    </View>
  )
}
