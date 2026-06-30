# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

### Required Services (All Free Tier)

#### Supabase (Database + Storage)
- Sign up: https://supabase.com
- Create new project
- Copy `DATABASE_URL` from Settings > Database > Connection string
- Copy `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` from Settings > API
- Create storage bucket: Storage > Create bucket > Name: `masanteya-files` > Make public

#### Upstash Redis (Cache)
- Sign up: https://upstash.com
- Create database
- Copy REST URL and token to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

#### Resend (Email)
- Sign up: https://resend.com
- Get API key from API Keys section
- Add domain or use sandbox: `onboarding@resend.dev`
- Copy to `RESEND_API_KEY`

#### Africa's Talking (SMS)
- Sign up: https://africastalking.com
- Get sandbox API key
- Copy `AT_API_KEY` and `AT_USERNAME`

#### JWT Secrets
Generate random secrets (must be at least 32 characters):
```bash
# On Linux/Mac:
openssl rand -base64 48

# Or use Node:
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed test data
npm run db:seed
```

## 4. Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000

## 5. Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+233501234567",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "country": "GH",
    "role": "PATIENT"
  }'
```

### Login (After Email Verification)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## 6. Run Tests

```bash
npm test
```

## 7. View Database

```bash
npx prisma studio
```

Opens GUI at http://localhost:5555

## 8. Build for Production

```bash
npm run build
npm run start:prod
```

## Common Issues

### Database Connection Error
- Check `DATABASE_URL` format
- Ensure Supabase project is active
- Check firewall/network settings

### Redis Connection Error
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check Upstash dashboard for database status

### Email Not Sending
- Verify `RESEND_API_KEY`
- Check domain verification status
- Review Resend logs

### SMS Not Sending
- Ensure `AT_ENVIRONMENT=sandbox` for testing
- Check Africa's Talking sandbox status
- Verify phone number format (+country code)

## Environment Variables Reference

```env
# Required
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your_64_char_secret
JWT_REFRESH_SECRET=your_64_char_secret
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
AT_API_KEY=...
AT_USERNAME=sandbox
CORS_ORIGINS=http://localhost:3000,exp://localhost:8081

# Optional
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Next Steps

1. ✅ Complete remaining module implementations (see `MODULE_TEMPLATES.md`)
2. ✅ Write comprehensive tests
3. ✅ Deploy to Railway.app
4. ✅ Build mobile app frontend (React Native + Expo)
5. ✅ Create admin dashboard (Next.js)

## Support

- Documentation: See `README.md` and `IMPLEMENTATION_GUIDE.md`
- Module Templates: See `MODULE_TEMPLATES.md`
- Issues: Open GitHub issue

Good luck! 🚀
