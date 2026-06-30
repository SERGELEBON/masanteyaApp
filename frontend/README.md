# MaSanteYa Mobile App

> Application mobile de santé pour le Ghana et la Guinée - Built with React Native + Expo SDK 51

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-51-black)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-4-38bdf8)](https://www.nativewind.dev/)

## 🎯 Features

- 🏥 **Télémédecine** - Consultations vidéo avec médecins
- 📊 **Monitoring de santé** - Suivi des signes vitaux (BPM, tension, glucose, SpO2)
- 📁 **Dossier médical** - Stockage sécurisé des documents médicaux
- 💊 **Gestion de médicaments** - Rappels automatiques, suivi d'adhérence
- 🗺️ **PharmFind** - Recherche géographique de pharmacies
- 🚚 **Livraison** - Commande et tracking en temps réel
- 🛡️ **Assurance** - Intégration NHIS (Ghana) / NSIA (Guinée)
- 🔐 **Sécurité** - Authentification biométrique, stockage sécurisé

## 🏗️ Stack Technique

```
Runtime:         React Native 0.74 + Expo SDK 51
Routing:         Expo Router v3 (file-based)
Language:        TypeScript 5 (strict mode)
Styling:         NativeWind v4 (Tailwind CSS for React Native)
State:           Zustand 4 + expo-secure-store
HTTP:            Axios 1.7 (auto-refresh JWT)
Real-time:       Socket.io-client 4
Forms:           React Hook Form 7 + Zod 3
Animations:      React Native Reanimated 3 + Moti
Maps:            react-native-maps (Google Maps SDK)
Push Notifs:     expo-notifications (Expo Push)
Biometrics:      expo-local-authentication
Storage:         expo-secure-store (JWT tokens)
Media:           expo-document-picker, expo-image-picker, expo-camera
Location:        expo-location
Icons:           @expo/vector-icons (Ionicons + MaterialCommunity)
```

## 📱 Screenshots

*[Add screenshots here]*

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

```bash
# Clone the repository
cd masanteya_app/frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your backend URL and API keys

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 📁 Project Structure

```
frontend/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (fonts, providers)
│   ├── index.tsx                 # Auth redirect
│   ├── (auth)/                   # Auth flow
│   │   ├── onboarding.tsx        # 3 slides intro
│   │   ├── login.tsx             # Login screen
│   │   └── register/             # Multi-step registration
│   ├── (app)/                    # Main app (bottom tabs)
│   │   ├── home.tsx              # Dashboard
│   │   ├── services.tsx          # Services grid
│   │   ├── notifications.tsx     # Notifications list
│   │   └── profile/              # User profile
│   └── (features)/               # Feature screens
│       ├── consultation/         # Telemedicine
│       ├── monitoring/           # Vitals tracking
│       ├── records/              # Medical records
│       ├── medications/          # Medications management
│       ├── delivery/             # Delivery + tracking
│       ├── insurance/            # Insurance cards
│       └── pharmfind/            # Map search
│
├── src/
│   ├── theme/                    # ✅ Design system (colors, typography, tokens)
│   ├── types/                    # TypeScript types
│   ├── api/                      # API client + services
│   │   ├── client.ts             # Axios with JWT auto-refresh
│   │   ├── auth.api.ts           # Auth endpoints
│   │   ├── users.api.ts          # User profile
│   │   ├── doctors.api.ts        # Doctors search
│   │   ├── consultations.api.ts  # Consultations
│   │   ├── vitals.api.ts         # Vitals
│   │   ├── records.api.ts        # Records
│   │   ├── medications.api.ts    # Medications
│   │   ├── delivery.api.ts       # Orders
│   │   ├── insurance.api.ts      # Insurance
│   │   └── pharmfind.api.ts      # Pharmacy search
│   │
│   ├── socket/                   # Socket.io client
│   │   └── socket.client.ts      # Singleton Socket.io instance
│   │
│   ├── stores/                   # Zustand state management
│   │   ├── auth.store.ts         # Auth state (persisted)
│   │   ├── user.store.ts         # User profile
│   │   └── notifications.store.ts# Notifications
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Auth hook
│   │   ├── useSocket.ts          # Socket.io hook
│   │   ├── usePushNotifications.ts# Push notifications
│   │   ├── useLocation.ts        # Geolocation
│   │   └── useBiometrics.ts      # Biometric auth
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx        # Animated button
│   │   │   ├── Input.tsx         # Text input
│   │   │   ├── OTPInput.tsx      # 6-digit OTP
│   │   │   ├── PhoneInput.tsx    # Phone with country code
│   │   │   ├── Card.tsx          # Container
│   │   │   ├── Badge.tsx         # Status badges
│   │   │   ├── Avatar.tsx        # User avatar
│   │   │   ├── ProgressBar.tsx   # Progress indicator
│   │   │   ├── Skeleton.tsx      # Loading skeleton
│   │   │   └── BottomSheet.tsx   # Bottom sheet modal
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── ScreenWrapper.tsx # Screen container
│   │   │   ├── Header.tsx        # Custom header
│   │   │   └── TabBar.tsx        # Bottom tab bar
│   │   │
│   │   └── features/             # Feature components
│   │       ├── DoctorCard.tsx    # Doctor list item
│   │       ├── VitalCard.tsx     # Vital sign card
│   │       ├── MedicalRecordItem.tsx# Record list item
│   │       ├── MedicationItem.tsx# Medication card
│   │       ├── PharmacyPin.tsx   # Map marker
│   │       └── InsuranceCard.tsx # Insurance card
│   │
│   └── utils/                    # Utility functions
│       ├── formatters.ts         # Data formatting
│       ├── validators.ts         # Validation helpers
│       └── secureStorage.ts      # Secure storage wrapper
│
├── assets/                       # Static assets
│   ├── images/                   # Images
│   └── icons/                    # Icons
│
├── app.json                      # ✅ Expo configuration
├── package.json                  # ✅ Dependencies
├── tsconfig.json                 # ✅ TypeScript config
├── tailwind.config.js            # ✅ NativeWind config
├── babel.config.js               # ✅ Babel config
├── .env.example                  # ✅ Environment variables template
└── README.md                     # ✅ This file
```

## 🎨 Design System

### Colors

```typescript
// Brown palette (primary)
brown: {
  400: '#B8875A',  // Primary brown
  500: '#9D6E42',
  // ...
}

// Blue palette (secondary)
blue: {
  400: '#5C95F5',  // Secondary blue
  500: '#3B7AF0',
  // ...
}

// Semantic colors
success: '#2D9E75'
warning: '#D4870A'
danger: '#C0392B'
info: '#3B7AF0'
```

### Typography

- **Headings**: h1-h6 (32px to 16px)
- **Body**: 16px regular/medium/semibold
- **Small**: 14px
- **Caption**: 12px
- **Tiny**: 11px
- **Font**: Inter (400, 500, 600, 700)

### Spacing

- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

## 🔐 Security

- ✅ JWT tokens in expo-secure-store (not AsyncStorage)
- ✅ Auto-refresh tokens with Axios interceptors
- ✅ Biometric authentication (Face ID, Touch ID)
- ✅ Session timeout after 30min inactivity
- ✅ Data masking for sensitive info (NHIS, phone)
- ✅ HTTPS only communication
- ✅ Input validation with Zod

## 🔄 State Management

**Zustand Stores:**

1. **auth.store.ts** - User authentication state (persisted)
2. **user.store.ts** - User profile data
3. **notifications.store.ts** - Notifications state

**Persistence:**
- Auth state persisted in expo-secure-store
- Other stores use in-memory state

## 🌐 API Integration

**Base URL**: `EXPO_PUBLIC_API_URL`

**Authentication**:
- Access token (15min) in Authorization header
- Auto-refresh on 401 error
- Logout on refresh failure

**Endpoints**: See backend API documentation

## 📡 Real-time Features (Socket.io)

**Events Listened:**
- `new_message` - Chat messages
- `vital_alert_received` - Critical vital alerts
- `courier_position` - Delivery tracking updates

**Events Emitted:**
- `join_consultation` - Join video call room
- `send_message` - Send chat message
- `join_order_tracking` - Track delivery

## 📲 Push Notifications

**Expo Push Notifications** (free tier):

1. Register push token on login
2. Backend sends via Expo Push Service
3. Foreground: Show banner
4. Background/Tapped: Navigate to screen

**Types**:
- MEDICATION_REMINDER → /medications/:id
- VITAL_ALERT → /monitoring
- CONSULTATION → /consultation/call/:roomId
- DELIVERY → /delivery/tracking/:orderId

## 🗺️ Maps Integration

**Google Maps SDK** (free tier with quota):

1. Enable Maps SDK for Android/iOS
2. Enable Directions API
3. Add API key to app.json
4. Use react-native-maps

**Features**:
- Pharmacy search with markers
- User location marker
- Delivery tracking with polyline
- Cluster markers when >3 nearby

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Lint code
npm run lint
```

## 📦 Build & Deploy

### Development Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview
```

### Production Build

```bash
# Build production
eas build --platform all --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🐛 Troubleshooting

### Metro bundler issues
```bash
# Clear cache
npx expo start --clear
```

### Module resolution errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### iOS Pods issues
```bash
cd ios
pod install --repo-update
cd ..
```

## 📖 Documentation

- **Frontend Implementation Guide**: `FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Backend API**: See `../README.md`
- **Figma Prototype**: [Link](https://stitch.withgoogle.com/preview/598638291182385808)

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file

## 👥 Team

MaSanteYa Team - Ghana & Guinea

## 🙏 Acknowledgments

- Expo team for the amazing SDK
- NativeWind for Tailwind CSS in React Native
- All open-source contributors

---

**Made with ❤️ for Ghana 🇬🇭 & Guinea 🇬🇳**
