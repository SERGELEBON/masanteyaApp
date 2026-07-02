# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MaSanteYa is a health mobile application for Ghana and Guinea providing telemedicine, health monitoring, medical records, medication tracking, pharmacy search & delivery, and insurance integration (NHIS/NSIA).

**Monorepo structure:**
- `/` - Backend API (Node.js + TypeScript + Express + Prisma + PostgreSQL)
- `/frontend` - Mobile app (React Native + Expo + NativeWind)

## Commands

### Backend (root directory)

**Development:**
```bash
npm run dev              # Start development server (tsx watch)
npm run build            # Compile TypeScript to dist/
npm start:prod           # Run production build
```

**Database:**
```bash
npx prisma generate      # Generate Prisma client after schema changes
npx prisma migrate dev   # Create and apply migration
npm run db:migrate       # Deploy migrations (production)
npm run db:push          # Push schema without migration
npm run db:seed          # Seed test data (Ghana & Guinea)
npm run db:studio        # Open Prisma Studio GUI
```

**Testing & Quality:**
```bash
npm test                 # Run tests with Vitest
npm run test:watch       # Watch mode
npm run lint             # ESLint check
npm run format           # Format with Prettier
```

### Frontend (/frontend directory)

**Development:**
```bash
npm start                # Start Expo dev server
npm run android          # Run on Android device/emulator
npm run ios              # Run on iOS device/simulator
npm run web              # Run in web browser
```

**Quality:**
```bash
npm run lint             # ESLint check
npm run type-check       # TypeScript check (tsc --noEmit)
```

## Architecture

### Backend Structure

**Entry points:**
- `src/server.ts` - HTTP + Socket.io server initialization
- `src/app.ts` - Express app factory (middleware, routes, error handling)

**Configuration (`src/config/`):**
- `env.ts` - Environment variables validated with Zod
- `database.ts` - Prisma client singleton
- `redis.ts` - Upstash Redis client for caching/rate limiting
- `socket.ts` - Socket.io server setup
- `logger.ts` - Winston logger (console + files)

**Shared layer (`src/shared/`):**
- `middleware/` - authenticate (JWT), authorize (RBAC), rateLimiter, validate (Zod), errorHandler
- `services/` - email (Resend), sms (Africa's Talking), storage (Supabase), cache (Redis), notifications
- `utils/` - jwt, hash (bcrypt), otp, response, paginate
- `types/` - TypeScript interfaces

**Modules (`src/modules/`):**
Each module follows this pattern:
- `*.schema.ts` - Zod validation schemas for requests
- `*.service.ts` - Business logic and database operations
- `*.controller.ts` - HTTP request handlers
- `*.router.ts` - Express route definitions

**Module status:**
- `auth/` - ✅ Complete (register, login, JWT refresh, OTP verification, password reset)
- `users/`, `doctors/`, `consultations/`, `vitals/`, `records/`, `medications/`, `delivery/`, `insurance/`, `pharmfind/` - Stubs (routers exist, implementation needed)

**Jobs (`src/jobs/`):**
- `medication-reminders.job.ts` - Cron job (every 5 min) using node-cron

**Database (`prisma/`):**
- `schema.prisma` - 23 models (User, Patient, Doctor, Consultation, VitalSign, MedicalRecord, Medication, Pharmacy, Order, Insurance, etc.)
- Enums: Country (GH/GN), UserRole, BloodGroup, ConsultationStatus, VitalType, OrderStatus, etc.
- Test accounts after seeding: `patient.gh@test.com`, `doctor.gh@test.com` (password: `Password123!`)

### Frontend Structure

**Routing (`app/`):**
- Expo Router v3 with file-based routing
- `(auth)/` - Onboarding, login, register screens
- `(app)/` - Main app with bottom tabs (home, services, consultations, monitoring, profile)
- `(features)/` - Feature-specific screens (doctors, vitals, records, medications, delivery, insurance, pharmfind)

**Source (`src/`):**
- `theme/` - colors, typography, tokens (NativeWind)
- `types/` - TypeScript interfaces matching backend API
- `api/` - Axios client with JWT auto-refresh + service modules
- `socket/` - Socket.io-client setup for real-time features
- `stores/` - Zustand stores (auth, user, consultations, etc.)
- `hooks/` - Custom React hooks
- `components/` - ui/, layout/, features/ components
- `utils/` - Formatters, validators, helpers

**State Management:**
- Zustand for global state
- expo-secure-store for JWT tokens (NOT AsyncStorage)
- React Query (@tanstack/react-query) for server state

**Key dependencies:**
- NativeWind v4 (Tailwind CSS for React Native)
- Expo Router (file-based navigation)
- React Hook Form + Zod (forms)
- Reanimated 3 + Moti (animations)
- Socket.io-client (real-time chat/tracking)
- react-native-maps (Google Maps)

## Key Technical Patterns

### Authentication Flow

1. User registers → OTP sent via email + SMS → verify → JWT access (15min) + refresh (7 days)
2. Login → JWT tokens stored in expo-secure-store (frontend) and blacklist checked (backend Redis)
3. Auto-refresh: Axios interceptor catches 401 → calls `/auth/refresh` → retries original request
4. Logout → tokens blacklisted in Redis

### Real-time Features (Socket.io)

- Consultations: chat messages, video call signaling
- Delivery: order tracking updates
- Vitals: alert notifications
- Setup in `src/config/socket.ts` (backend) and `src/socket/` (frontend)

### Database Patterns

- Prisma ORM with strict TypeScript types
- Relations: User → Patient/Doctor, Doctor → Consultations, Patient → VitalSigns/MedicalRecords/Medications
- Soft deletes: `deletedAt` field
- Always use `prisma` singleton from `src/config/database.ts`

### Error Handling

- Backend: `express-async-errors` + centralized `errorHandler` middleware
- Custom `ApiError` class with status codes
- `ApiResponse` utility for consistent JSON responses
- Frontend: Try/catch in services, Toast messages for user feedback

### Security

- JWT with rotation (access 15min, refresh 7 days)
- bcrypt password hashing (12 rounds)
- Rate limiting on all endpoints (express-rate-limit + Redis)
- Helmet.js for security headers
- CORS configured for specific origins
- Zod validation on all inputs
- RBAC with `authorize()` middleware

## External Services Configuration

**Required environment variables:**

Backend (`.env`):
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` - For file storage
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - Redis cache
- `RESEND_API_KEY` - Email service
- `AT_API_KEY`, `AT_USERNAME` - Africa's Talking SMS
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` - JWT signing

Frontend (`.env`):
- `EXPO_PUBLIC_API_URL` - Backend API base URL (e.g., http://localhost:3000/api/v1)
- `EXPO_PUBLIC_SOCKET_URL` - Socket.io server URL
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY` - Google Maps API key (optional)

## Development Workflow

### Starting a new backend module

1. Copy structure from `src/modules/auth/` or refer to `MODULE_TEMPLATES.md`
2. Create `*.schema.ts` with Zod validation
3. Implement `*.service.ts` with business logic + Prisma queries
4. Create `*.controller.ts` with request handlers
5. Define routes in `*.router.ts`
6. Register router in `src/app.ts`

### Starting a new frontend screen

1. Create file in appropriate `app/` directory
2. Use `src/theme/` tokens for consistent styling
3. Create corresponding API service in `src/api/`
4. Use Zustand store if needed for state
5. Follow templates in `FRONTEND_IMPLEMENTATION_GUIDE.md`

### Running tests

- Backend: `npm test` (Vitest) - tests in `tests/` directory
- Write tests for services, controllers, and utilities
- Use Supertest for API integration tests

### Database changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Run `npx prisma generate` to update Prisma client
4. Update seed file if needed: `prisma/seed.ts`

## Common Issues

**Prisma client out of sync:**
```bash
npx prisma generate
```

**Redis connection errors:**
- Check Upstash credentials in `.env`
- Verify network access to Upstash

**Frontend metro bundler cache issues:**
```bash
cd frontend
npx expo start -c
```

**JWT token errors:**
- Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Check token expiry times in `src/shared/utils/jwt.ts`

## Code Style

- TypeScript strict mode enabled
- Use async/await (no callbacks)
- Prefer named exports over default exports
- Use Zod for runtime validation
- Error messages in French (target audience: Ghana & Guinea)
- Follow existing patterns in `src/modules/auth/` for consistency