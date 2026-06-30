import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default('MaSanteYa API'),
  APP_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().optional(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string(),
  SUPABASE_STORAGE_BUCKET: z.string().default('masanteya-files'),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  AT_API_KEY: z.string(),
  AT_USERNAME: z.string(),
  AT_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  LOCKOUT_MINUTES: z.coerce.number().default(15),
  CORS_ORIGINS: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.flatten(), null, 2))
  process.exit(1)
}

export const env = parsed.data