import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { colors } from '@/theme/colors'

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.97)
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1)
    onPressOut?.(e)
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brown-400 active:bg-brown-500'
      case 'secondary':
        return 'bg-blue-400 active:bg-blue-500'
      case 'outline':
        return 'border-2 border-brown-400 bg-transparent'
      case 'ghost':
        return 'bg-transparent'
      case 'danger':
        return 'bg-danger active:bg-red-700'
    }
  }

  const getTextClasses = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return 'text-white'
      case 'outline':
      case 'ghost':
        return 'text-brown-400'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-9 px-3'
      case 'md':
        return 'h-11 px-4'
      case 'lg':
        return 'h-14 px-6'
    }
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-base'
      case 'lg':
        return 'text-lg'
    }
  }

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50' : ''}
        rounded-md flex-row items-center justify-center
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.brown[400] : colors.white} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${getTextClasses()} ${getTextSizeClasses()} font-semibold`}>
            {children}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </AnimatedTouchable>
  )
}
