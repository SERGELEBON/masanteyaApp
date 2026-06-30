# MaSanteYa API - Implementation Guide

## Project Structure Created

✅ **Configuration Files**
- `package.json`, `tsconfig.json`, `.env.example`
- `prisma/schema.prisma` (complete database schema)
- `src/config/` (env, database, redis, socket, logger)

✅ **Shared Layer**
- `src/shared/utils/` (jwt, hash, otp, response, paginate)
- `src/shared/services/` (email, sms, storage, cache, notification)
- `src/shared/middleware/` (authenticate, authorize, rateLimiter, validate, errorHandler)
- `src/shared/types/` (TypeScript interfaces and types)

✅ **Core Application**
- `src/app.ts` (Express app factory with all routes)
- `src/server.ts` (HTTP server + Socket.io initialization)

## Next Steps - Complete Module Implementation

Each module follows this pattern: **schema.ts → service.ts → controller.ts → router.ts**

### Modules to Implement

1. ✅ **auth/** - Authentication (register, login, refresh, OTP verification)
2. **users/** - User profile management
3. **doctors/** - Doctor profiles, availability, search
4. **consultations/** - Telemedicine appointments + Socket.io chat
5. **vitals/** - Health monitoring (heart rate, BP, glucose, etc.)
6. **records/** - Medical records with file uploads
7. **medications/** - Med tracking with reminders
8. **delivery/** - Pharmacy delivery orders
9. **insurance/** - NHIS/NSIA integration
10. **pharmfind/** - Geospatial pharmacy search (Haversine)

### Module Template

For each module, create 4 files:

```typescript
// schema.ts - Zod validation schemas
export const createSchema = z.object({
  body: z.object({
    // field validations
  })
})

// service.ts - Business logic
export class XxxService {
  static async create(data) {
    // Prisma operations
    // Cache operations
    // External service calls
  }
}

// controller.ts - HTTP request handlers
export class XxxController {
  static async create(req: AuthRequest, res: Response) {
    const result = await XxxService.create(req.body)
    return ApiResponse.created(res, result)
  }
}

// router.ts - Express routes
const router = Router()
router.post('/', authenticate, validate(createSchema), XxxController.create)
export default router
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm run start:prod
```

## Database Setup (Supabase)

1. Create project at https://supabase.com
2. Get `DATABASE_URL` from Settings > Database
3. Get `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from Settings > API
4. Create storage bucket named `masanteya-files` in Storage section
5. Set bucket to public or create appropriate RLS policies

## Redis Setup (Upstash)

1. Create database at https://upstash.com
2. Get REST URL and token from database details
3. Add to `.env` as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

## Email Setup (Resend)

1. Sign up at https://resend.com
2. Get API key from API Keys section
3. Verify your domain or use sandbox mode
4. Add to `.env` as `RESEND_API_KEY`

## SMS Setup (Africa's Talking)

1. Sign up at https://africastalking.com
2. Get API key and username
3. Use sandbox mode for development
4. Add to `.env` as `AT_API_KEY` and `AT_USERNAME`

## Key Implementation Details

### Authentication Flow

1. **Register**: Hash password → Create user → Send OTP via email & SMS
2. **Verify Email/Phone**: Check OTP code → Mark as verified
3. **Login**: Verify credentials → Check attempts (Redis) → Generate JWT tokens → Store refresh token
4. **Refresh**: Verify refresh token → Rotate token → Generate new access token
5. **Logout**: Blacklist access token (Redis) → Delete refresh token

### Socket.io Events

- `join_consultation` - Join video call room
- `send_message` - Send chat message
- `vital_alert` - Send critical vital sign alert
- `courier_location` - Update delivery tracking
- `join_order_tracking` - Track medication delivery

### PharmFind Haversine Query

Use Prisma `$queryRaw` for geospatial search:

```typescript
const pharmacies = await prisma.$queryRaw`
  SELECT p.*, ps.available, ps.price,
    (6371 * acos(
      cos(radians(${lat})) * cos(radians(p.latitude::float))
      * cos(radians(p.longitude::float) - radians(${lng}))
      + sin(radians(${lat})) * sin(radians(p.latitude::float))
    )) AS distance_km
  FROM pharmacies p
  JOIN pharmacy_stocks ps ON ps.pharmacy_id = p.id
  WHERE ps.medication_name ILIKE ${`%${medication}%`}
    AND ps.available = true
    AND p.country = ${country}
  HAVING distance_km <= ${radiusKm}
  ORDER BY distance_km ASC
  LIMIT 20
`
```

### Cron Jobs

**Medication Reminders** (`src/jobs/medication-reminders.job.ts`):
- Runs every 5 minutes
- Finds upcoming medication intakes
- Sends push notifications
- Sends SMS for critical times (morning/evening)

**Vitals Alerts** (to implement):
- Monitor for WARNING/CRITICAL status
- Notify patient and assigned doctor
- Send via Socket.io + push notification

## Testing Strategy

Create tests for:
- `tests/auth.test.ts` - Registration, login, OTP verification
- `tests/vitals.test.ts` - Vital sign recording, alerts
- `tests/pharmfind.test.ts` - Geospatial pharmacy search

Use Vitest + Supertest for API testing.

## Deployment (Railway)

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard

# Deploy
railway up
```

Or use GitHub Actions for CI/CD (see `.github/workflows/deploy.yml`).

## Security Checklist

✅ JWT with short-lived access tokens (15min) + refresh tokens (7 days)
✅ Password hashing with bcrypt (12 rounds)
✅ Rate limiting on all endpoints
✅ Redis-based login attempt tracking
✅ Token blacklisting for logout
✅ Helmet.js for HTTP headers security
✅ CORS configured for specific origins
✅ Input validation with Zod
✅ SQL injection prevention via Prisma parameterized queries
✅ File upload validation (type, size)
✅ OTP expiry and one-time use
✅ RBAC (Role-Based Access Control)

## API Endpoints

All endpoints are prefixed with `/api/v1/`

**Auth**: POST `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/verify-phone`

**Users**: GET `/users/me`, PATCH `/users/me`, POST `/users/me/avatar`

**Doctors**: GET `/doctors`, `/doctors/:id`, `/doctors/:id/availability`

**Consultations**: POST `/consultations`, GET `/consultations`, `/consultations/:id`

**Vitals**: POST `/vitals`, GET `/vitals`, `/vitals/latest`, `/vitals/stats`

**Records**: GET `/records`, POST `/records`, `/records/:id`

**Medications**: GET `/medications`, POST `/medications`, `/medications/:id/intake`

**Delivery**: GET `/delivery/pharmacies`, POST `/delivery/orders`, `/delivery/orders/:id`

**Insurance**: GET `/insurance`, POST `/insurance`, `/insurance/:id`

**PharmFind**: GET `/pharmfind/search?lat=&lng=&medication=&radius=&country=`

## Support

For issues and questions:
- Check logs in Railway dashboard
- Use `npx prisma studio` to inspect database
- Monitor Redis with Upstash console
- Check Supabase logs for storage issues

## License

MIT
