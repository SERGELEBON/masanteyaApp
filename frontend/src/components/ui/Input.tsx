import React, { useState } from 'react'
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isPassword?: boolean
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const getBorderColor = () => {
    if (error) return 'border-danger'
    if (isFocused) return 'border-blue-400'
    return 'border-neutral-200'
  }

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-brown-700 mb-2">
          {label}
        </Text>
      )}
      <View className={`
        border ${getBorderColor()}
        rounded-md
        px-4
        h-11
        bg-neutral-50
        flex-row
        items-center
      `}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 text-base text-neutral-900"
          placeholderTextColor={colors.neutral[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-xs text-danger mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-xs text-neutral-500 mt-1">{helperText}</Text>
      )}
    </View>
  )
}
