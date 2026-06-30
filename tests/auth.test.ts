import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/database'

const app = createApp()

describe('Auth Module', () => {
  const testUser = {
    email: 'test@masanteya.com',
    phone: '+233501111111',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    country: 'GH',
    role: 'PATIENT',
  }

  let userId: string
  let accessToken: string
  let refreshToken: string

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } })
    await prisma.$disconnect()
  })

  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.userId).toBeDefined()

    userId = res.body.data.userId
  })

  it('should not register with duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should not login without email verification', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(401)
  })

  it('should verify email with OTP', async () => {
    const otpCode = await prisma.otpCode.findFirst({
      where: { userId, type: 'EMAIL_VERIFY', usedAt: null },
    })

    const res = await request(app).post('/api/v1/auth/verify-email').send({
      userId,
      code: otpCode?.code,
      type: 'EMAIL_VERIFY',
    })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should login after email verification', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.refreshToken).toBeDefined()

    accessToken = res.body.data.accessToken
    refreshToken = res.body.data.refreshToken
  })

  it('should refresh access token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('should logout user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
