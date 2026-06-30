# MaSanteYa Frontend - Summary Documentation

## Overview

This is the complete React Native mobile application for **MaSanteYa**, a comprehensive health platform for Ghana and Guinea. Built with Expo SDK 51, the app provides telemedicine, health monitoring, medical records management, medication tracking, pharmacy search, delivery services, and insurance integration.

## Tech Stack

### Core Technologies
- **React Native**: 0.74.3
- **Expo SDK**: 51
- **TypeScript**: 5.3.3
- **Expo Router**: v3 (file-based routing)

### State Management & API
- **Zustand**: 4.5.2 (global state management)
- **Axios**: 1.6.7 (HTTP client with interceptors)
- **Socket.io Client**: 4.7.4 (real-time communication)
- **expo-secure-store**: Secure token storage

### UI & Styling
- **NativeWind**: 4.0.36 (Tailwind CSS for React Native)
- **Reanimated**: 3.10.1 (animations)
- **React Native Gesture Handler**: 2.16.1

### Additional Libraries
- **expo-location**: Geolocation services
- **expo-camera**: Camera access
- **expo-document-picker**: File uploads
- **expo-notifications**: Push notifications
- **react-native-toast-message**: Toast notifications

## Project Structure

```
frontend/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── onboarding.tsx       # 3-slide onboarding
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Registration with country selection
│   │   └── verify.tsx           # OTP verification
│   ├── (app)/                    # Main app screens
│   │   ├── _layout.tsx          # Tab navigation layout
│   │   ├── home.tsx             # Home dashboard
│   │   ├── services.tsx         # Services grid
│   │   ├── notifications.tsx    # Notifications list
│   │   └── profile.tsx          # User profile
│   ├── (features)/               # Feature screens
│   │   ├── consultation/        # Doctor search & booking
│   │   ├── monitoring/          # Vitals tracking
│   │   ├── medications/         # Medication management
│   │   ├── pharmfind/           # Pharmacy geolocation search
│   │   ├── records/             # Medical records
│   │   ├── delivery/            # Pharmacy delivery
│   │   └── insurance/           # NHIS/NSIA integration
│   └── _layout.tsx              # Root layout
├── src/
│   ├── api/                      # API services
│   │   ├── client.ts            # Axios instance with JWT auto-refresh
│   │   ├── auth.api.ts          # Authentication endpoints
│   │   ├── users.api.ts         # User management
│   │   ├── doctors.api.ts       # Doctor search
│   │   ├── vitals.api.ts        # Vitals tracking
│   │   ├── medications.api.ts   # Medications
│   │   └── pharmfind.api.ts     # Pharmacy search
│   ├── components/
│   │   └── ui/                  # Reusable UI components
│   │       ├── Button.tsx       # Animated button (4 variants)
│   │       ├── Input.tsx        # Input with validation
│   │       └── Card.tsx         # Card container (3 variants)
│   ├── stores/
│   │   └── auth.store.ts        # Zustand auth store with persistence
│   ├── hooks/
│   │   └── useAuth.ts           # Auth hook wrapper
│   ├── theme/
│   │   ├── colors.ts            # Complete color system
│   │   ├── typography.ts        # Font configuration
│   │   └── tokens.ts            # Design tokens
│   ├── types/
│   │   └── api.types.ts         # TypeScript API types
│   └── lib/
│       └── socket.ts            # Socket.io client configuration
├── package.json                  # Dependencies
├── app.json                      # Expo configuration
├── tailwind.config.js            # NativeWind configuration
├── tsconfig.json                 # TypeScript configuration
└── babel.config.js               # Babel configuration

```

## Key Features Implementation

### 1. Authentication Flow

**Files**: `app/(auth)/*`

- **Onboarding**: 3 slides with animations, skip option
- **Registration**: Multi-step with Ghana/Guinea country selection
- **Login**: Email/password with biometric option placeholder
- **OTP Verification**: 6-digit code with countdown timer and resend

**Security**:
- JWT access tokens (15min) stored in expo-secure-store
- Refresh tokens (7 days) with auto-refresh via Axios interceptors
- Token rotation on logout

### 2. Home Dashboard

**File**: `app/(app)/home.tsx`

Features:
- User greeting with country flag (🇬🇭/🇬🇳)
- Vitals summary card (heart rate, blood pressure)
- 7 service tiles (Consultation, Monitoring, Dossiers, Médicaments, PharmFind, Livraison, Assurance)
- Pull-to-refresh

### 3. Health Monitoring

**File**: `app/(features)/monitoring/index.tsx`

Features:
- 6 vital sign cards: Heart Rate, Blood Pressure, Temperature, O₂ Saturation, Blood Glucose, Weight
- Latest readings with timestamps
- Color-coded icons
- Add new measurement button
- Historical data view

### 4. Consultations

**File**: `app/(features)/consultation/index.tsx`

Features:
- Doctor search with filters
- Specialty filtering (General, Cardiologist, Dermatologist, Pediatrician)
- Doctor cards with ratings, reviews, availability
- Consultation fees
- Booking flow

### 5. Medications

**File**: `app/(features)/medications/index.tsx`

Features:
- Medication list with dosage, frequency
- Next dose reminders
- Mark as taken functionality
- Filter: Active/All/Completed
- Add medication form

### 6. PharmFind (Geolocation)

**File**: `app/(features)/pharmfind/index.tsx`

Features:
- Location permission request
- Map view placeholder (Google Maps integration)
- Nearby pharmacy list with distance calculation
- Pharmacy details: address, phone, hours, open/closed status
- Call pharmacy button
- Google Maps directions integration

### 7. Medical Records

**File**: `app/(features)/records/index.tsx`

Features:
- Document types: Prescriptions, Lab Results, Imaging, Consultation Notes
- File upload support
- Document viewer
- Download functionality
- Filter by document type

### 8. Delivery

**File**: `app/(features)/delivery/index.tsx`

Features:
- Order tracking with status (Pending, Confirmed, In Transit, Delivered)
- Estimated delivery time
- Order history
- Real-time tracking (Socket.io integration ready)
- Pharmacy selection and cart

### 9. Insurance

**File**: `app/(features)/insurance/index.tsx`

Features:
- **NHIS** card for Ghana (🇬🇭)
- **NSIA** card for Guinée (🇬🇳)
- Digital insurance card with policy number, member name, validity
- Claims submission
- Claims history with status (Pending, Approved, Rejected)

## Design System

### Color Palette

```typescript
// Primary Colors
brown: {
  50: '#FAF5F0',
  100: '#F5EBE0',
  200: '#EBD7C1',
  300: '#D9BB9E',
  400: '#B8875A',  // Primary
  500: '#9D6E42',
  600: '#7D5633',
  700: '#5C3E24',
  800: '#3B2715',
  900: '#1F1409',
}

blue: {
  50: '#F0F6FF',
  100: '#E0EDFF',
  200: '#C2DBFF',
  300: '#94C2FF',
  400: '#5C95F5',  // Secondary
  500: '#3B7AF0',
  600: '#2361E0',
  700: '#1A4AB8',
  800: '#123580',
  900: '#0A1E4E',
}

// Semantic Colors
success: '#2D9E75'
danger: '#C0392B'
warning: '#F39C12'
info: '#3498DB'
```

### Typography

- **Font**: System default (sans-serif)
- **Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px)
- **Weights**: normal (400), medium (500), semibold (600), bold (700)

### Components

#### Button
- **Variants**: primary, secondary, outline, ghost
- **Sizes**: sm, md, lg
- **Features**: Loading state, disabled state, animations (spring on press)

#### Input
- **Features**: Label, placeholder, error state, left/right icons, password toggle
- **Types**: text, email, password, phone

#### Card
- **Variants**: flat, outlined, elevated
- **Padding**: sm, md, lg, none

## API Integration

### Base Configuration

```typescript
// src/api/client.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'

apiClient.interceptors.request.use((config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = await SecureStore.getItemAsync('refresh_token')
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
      await SecureStore.setItemAsync('access_token', data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(originalRequest)
    }
    return Promise.reject(error)
  }
)
```

### Available Services

- **authApi**: login, register, verifyOtp, resendOtp, logout, refresh
- **usersApi**: getMe, updateProfile, updatePassword
- **doctorsApi**: search, getById, getAvailability
- **vitalsApi**: getLatest, getHistory, create
- **medicationsApi**: getAll, create, update, delete, markTaken
- **pharmfindApi**: searchNearby, getById

## State Management

### Zustand Auth Store

```typescript
// src/stores/auth.store.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { user, accessToken, refreshToken } = await authApi.login(email, password)
        await SecureStore.setItemAsync('access_token', accessToken)
        await SecureStore.setItemAsync('refresh_token', refreshToken)
        set({ user, isAuthenticated: true })
      },

      logout: async () => {
        await authApi.logout()
        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
)
```

## Navigation Structure

### Routes

```
/                           # Root (redirects to /onboarding or /home)
/(auth)/
  /onboarding              # First-time user onboarding
  /login                   # Login screen
  /register                # Registration screen
  /verify                  # OTP verification

/(app)/                    # Tab navigation
  /home                    # Home dashboard (Tab 1)
  /services                # Services grid (Tab 2)
  /notifications           # Notifications (Tab 3)
  /profile                 # Profile & settings (Tab 4)

/(features)/
  /consultation            # Doctor search & booking
  /monitoring              # Vitals tracking
  /medications             # Medication management
  /pharmfind               # Pharmacy geolocation
  /records                 # Medical records
  /delivery                # Pharmacy delivery
  /insurance               # NHIS/NSIA insurance
```

## Environment Variables

```env
# .env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

## Running the App

### Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Production Build

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Key Implementation Patterns

### 1. File-Based Routing (Expo Router v3)

```typescript
// Navigation
router.push('/login')                    // Navigate to login
router.replace('/(app)/home')            // Replace with home
router.back()                            // Go back
```

### 2. Secure Token Storage

```typescript
// Always use SecureStore for tokens
await SecureStore.setItemAsync('access_token', token)
const token = await SecureStore.getItemAsync('access_token')
await SecureStore.deleteItemAsync('access_token')
```

### 3. Toast Notifications

```typescript
Toast.show({
  type: 'success',           // success | error | info
  text1: 'Success!',
  text2: 'Operation completed',
})
```

### 4. NativeWind Styling

```tsx
<View className="flex-1 bg-neutral-50 p-6">
  <Text className="text-2xl font-bold text-brown-700">
    Hello World
  </Text>
</View>
```

### 5. Animations with Reanimated

```typescript
const scale = useSharedValue(1)

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}))

const handlePress = () => {
  scale.value = withSpring(0.95)
}
```

## Country-Specific Features

### Ghana (GH) 🇬🇭
- **Insurance**: NHIS (National Health Insurance Scheme)
- **Phone Format**: +233 50 123 4567
- **Currency**: GHS (Ghana Cedi)

### Guinée (GN) 🇬🇳
- **Insurance**: NSIA Assurances
- **Phone Format**: +224 62 123 4567
- **Currency**: GNF (Guinean Franc) - displays GHS in mockups

## Next Steps for Production

### Backend Integration
1. Replace mock data with actual API calls
2. Configure `EXPO_PUBLIC_API_URL` environment variable
3. Test JWT auto-refresh flow end-to-end
4. Implement Socket.io real-time features (consultations, delivery tracking)

### Maps Integration
5. Add Google Maps API key to `app.json`
6. Implement actual map view in PharmFind
7. Configure Haversine distance calculation on backend

### Push Notifications
8. Configure Firebase Cloud Messaging (FCM)
9. Add notification handlers
10. Test notification flows

### File Upload
11. Implement camera integration for medical records
12. Add document picker for file uploads
13. Configure Supabase storage integration

### Testing
14. Add unit tests (Jest + React Native Testing Library)
15. Add E2E tests (Detox)
16. Test on physical devices (iOS + Android)

### Performance
17. Optimize bundle size (code splitting)
18. Add image optimization
19. Implement data caching strategies

### Deployment
20. Configure EAS Build
21. Set up app signing (iOS certificates, Android keystore)
22. Submit to App Store & Google Play
23. Configure OTA updates

## Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured
- **Formatting**: Prettier configured
- **Type Safety**: Full API type definitions

## Support

For issues or questions:
- Backend API: See `backend/PROJECT_SUMMARY.md`
- Frontend: This document
- Expo Router: https://docs.expo.dev/router/introduction/

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Platform**: React Native (Expo SDK 51)
