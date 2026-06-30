# Module Implementation Templates

> Guides détaillés pour implémenter les modules restants

## Module Pattern

Chaque module suit strictement: **schema.ts → service.ts → controller.ts → router.ts**

---

## 1. USERS Module

### users.schema.ts

```typescript
import { z } from 'zod'

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    city: z.string().optional(),
    bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG']).optional(),
  }),
})
```

### users.service.ts

```typescript
export class UsersService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true, doctorProfile: true },
    })
    if (!user) throw new Error('Utilisateur introuvable')
    return user
  }

  static async updateProfile(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    })
  }

  static async uploadAvatar(userId: string, file: Buffer, contentType: string) {
    const result = await StorageService.upload({
      folder: 'avatars',
      fileName: `${userId}.jpg`,
      file,
      contentType,
    })

    if (!result) throw new Error('Upload échoué')

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.url },
    })

    return { avatarUrl: result.url }
  }
}
```

### users.controller.ts & users.router.ts

Suivre le pattern du module auth.

---

## 2. DOCTORS Module

### Key Features

- Recherche avec filtres (country, specialty, isOnline, acceptsNHIS)
- Pagination
- Disponibilités hebdomadaires
- Rating et reviews

### doctors.service.ts

```typescript
export class DoctorsService {
  static async search(filters: {
    country?: string
    specialty?: string
    isOnline?: boolean
    acceptsNHIS?: boolean
    page?: number
    limit?: number
  }) {
    const { skip, take, page, limit } = PaginationHelper.getPaginationParams(filters)

    const where: any = {}
    if (filters.country) where.country = filters.country
    if (filters.specialty) where.specialty = { contains: filters.specialty, mode: 'insensitive' }
    if (filters.isOnline !== undefined) where.isOnline = filters.isOnline
    if (filters.acceptsNHIS !== undefined) where.acceptsNHIS = filters.acceptsNHIS

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take,
        include: { user: true },
        orderBy: { rating: 'desc' },
      }),
      prisma.doctor.count({ where }),
    ])

    return PaginationHelper.createPaginatedResult(doctors, total, page, limit)
  }

  static async getById(id: string) {
    const cacheKey = CacheService.buildKey('doctor', id)
    const cached = await CacheService.get(cacheKey)
    if (cached) return cached

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        availabilities: true,
        consultations: {
          where: { status: 'COMPLETED' },
          take: 5,
          orderBy: { endedAt: 'desc' },
          include: { review: true },
        },
      },
    })

    if (!doctor) throw new Error('Médecin introuvable')

    await CacheService.set(cacheKey, doctor, 300) // Cache 5min

    return doctor
  }
}
```

---

## 3. CONSULTATIONS Module

### Key Features

- Planification de consultations
- WebRTC signaling via Socket.io
- Chat en temps réel
- Notes médicales
- Reviews

### consultations.service.ts

```typescript
export class ConsultationsService {
  static async book(patientId: string, data: {
    doctorId: string
    scheduledAt: string
    notes?: string
  }) {
    const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId } })
    if (!doctor) throw new Error('Médecin introuvable')

    const roomId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const consultation = await prisma.consultation.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        scheduledAt: new Date(data.scheduledAt),
        fee: doctor.consultationFee,
        currency: doctor.currency,
        notes: data.notes,
        roomId,
      },
      include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
    })

    // Envoyer notifications
    await Promise.all([
      NotificationService.send({
        userId: consultation.patient.userId,
        title: 'Consultation confirmée',
        body: `Votre consultation avec Dr. ${consultation.doctor.user.firstName} est confirmée`,
        type: 'CONSULTATION',
      }),
      EmailService.sendConsultationConfirmation(
        consultation.patient.user.email,
        `${consultation.doctor.user.firstName} ${consultation.doctor.user.lastName}`,
        consultation.scheduledAt
      ),
    ])

    return consultation
  }

  static async start(consultationId: string, doctorId: string) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    })

    if (!consultation || consultation.doctorId !== doctorId) {
      throw new Error('Non autorisé')
    }

    return await prisma.consultation.update({
      where: { id: consultationId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
    })
  }

  static async end(consultationId: string, data: {
    diagnosis?: string
    prescription?: string
    notes?: string
  }) {
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    })

    if (!consultation || consultation.status !== 'IN_PROGRESS') {
      throw new Error('Consultation invalide')
    }

    const startedAt = consultation.startedAt!
    const endedAt = new Date()
    const durationMin = Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000)

    return await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED',
        endedAt,
        durationMin,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes,
      },
    })
  }
}
```

---

## 4. VITALS Module

### Key Features

- Enregistrement multi-types (BPM, BP, glucose, SpO2, temp, poids)
- Détection automatique de statut (NORMAL/WARNING/CRITICAL)
- Statistiques et graphiques
- Alertes temps réel

### vitals.service.ts

```typescript
export class VitalsService {
  static determineStatus(type: string, value: any): VitalStatus {
    switch (type) {
      case 'HEART_RATE':
        if (value < 60 || value > 100) return 'WARNING'
        if (value < 40 || value > 150) return 'CRITICAL'
        return 'NORMAL'

      case 'BLOOD_PRESSURE':
        const { systolic, diastolic } = value
        if (systolic >= 140 || diastolic >= 90) return 'WARNING'
        if (systolic >= 180 || diastolic >= 120) return 'CRITICAL'
        return 'NORMAL'

      case 'GLUCOSE':
        if (value < 70 || value > 140) return 'WARNING'
        if (value < 50 || value > 250) return 'CRITICAL'
        return 'NORMAL'

      default:
        return 'NORMAL'
    }
  }

  static async record(patientId: string, data: {
    type: VitalType
    value: any
    unit: string
    deviceId?: string
  }) {
    const status = this.determineStatus(data.type, data.value)

    const vital = await prisma.vitalSign.create({
      data: {
        patientId,
        type: data.type,
        valueJson: data.value,
        unit: data.unit,
        status,
        deviceId: data.deviceId,
      },
    })

    // Envoyer alerte si WARNING ou CRITICAL
    if (status !== 'NORMAL') {
      await NotificationService.send({
        userId: patientId,
        title: status === 'CRITICAL' ? '🚨 Alerte Critique' : '⚠️ Attention',
        body: `Votre ${data.type} est ${status === 'CRITICAL' ? 'critique' : 'élevé'}`,
        type: 'VITAL_ALERT',
        data: { vitalId: vital.id, status },
      })
    }

    return vital
  }

  static async getLatest(patientId: string) {
    const types = ['HEART_RATE', 'BLOOD_PRESSURE', 'GLUCOSE', 'SPO2', 'TEMPERATURE', 'WEIGHT']

    const latest = await Promise.all(
      types.map((type) =>
        prisma.vitalSign.findFirst({
          where: { patientId, type: type as any },
          orderBy: { measuredAt: 'desc' },
        })
      )
    )

    return Object.fromEntries(types.map((type, i) => [type, latest[i]]))
  }
}
```

---

## 5. PHARMFIND Module (Geospatial)

### pharmfind.service.ts

```typescript
export class PharmFindService {
  static async searchNearby(params: {
    lat: number
    lng: number
    medicationName: string
    country: string
    radiusKm?: number
    nhisOnly?: boolean
  }) {
    const { lat, lng, medicationName, country, radiusKm = 10, nhisOnly = false } = params

    const cacheKey = CacheService.buildKey('pharmfind', lat, lng, medicationName, country)
    const cached = await CacheService.get(cacheKey)
    if (cached) return cached

    const results = await prisma.$queryRaw`
      SELECT
        p.*,
        ps.available,
        ps.quantity,
        ps.price,
        ps.currency,
        (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(p.latitude::float))
            * cos(radians(p.longitude::float) - radians(${lng}))
            + sin(radians(${lat})) * sin(radians(p.latitude::float))
          )
        ) AS distance_km
      FROM pharmacies p
      JOIN pharmacy_stocks ps ON ps.pharmacy_id = p.id
      WHERE
        ps.medication_name ILIKE ${`%${medicationName}%`}
        AND ps.available = true
        AND ps.quantity > 0
        AND p.country = ${country}
        AND (${nhisOnly}::boolean = false OR p.accepts_nhis = true)
        AND (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(p.latitude::float))
            * cos(radians(p.longitude::float) - radians(${lng}))
            + sin(radians(${lat})) * sin(radians(p.latitude::float))
          )
        ) <= ${radiusKm}
      ORDER BY distance_km ASC
      LIMIT 20
    `

    await CacheService.set(cacheKey, results, 120) // Cache 2min

    return results
  }

  static async getPharmaciesOnDuty(country: string) {
    return await prisma.pharmacy.findMany({
      where: { country: country as any, isOnDuty: true, isOpen: true },
      orderBy: { name: 'asc' },
    })
  }
}
```

---

## 6. MEDICATIONS & DELIVERY Modules

Suivre les mêmes patterns:

- **Medications**: CRUD + rappels automatiques (déjà implémenté dans cron job)
- **Delivery**: Commandes + tracking temps réel Socket.io

---

## 7. Testing Strategy

### Example: vitals.test.ts

```typescript
describe('Vitals Module', () => {
  let patientId: string
  let accessToken: string

  beforeAll(async () => {
    // Créer patient de test
    const user = await AuthService.register({ /* data */ })
    patientId = user.userId
    const login = await AuthService.login(email, password)
    accessToken = login.accessToken
  })

  it('should record heart rate', async () => {
    const res = await request(app)
      .post('/api/v1/vitals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'HEART_RATE',
        value: 72,
        unit: 'bpm',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('NORMAL')
  })

  it('should trigger WARNING for high BP', async () => {
    const res = await request(app)
      .post('/api/v1/vitals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'BLOOD_PRESSURE',
        value: { systolic: 150, diastolic: 95 },
        unit: 'mmHg',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe('WARNING')
  })

  it('should get latest vitals', async () => {
    const res = await request(app)
      .get('/api/v1/vitals/latest')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('HEART_RATE')
  })
})
```

---

## Implementation Checklist

Pour chaque module:

- [ ] Créer `schema.ts` avec validation Zod
- [ ] Créer `service.ts` avec logique métier
- [ ] Créer `controller.ts` pour gérer les requêtes HTTP
- [ ] Créer `router.ts` avec routes et middleware
- [ ] Ajouter cache Redis pour requêtes fréquentes
- [ ] Implémenter notifications (push + email/SMS si nécessaire)
- [ ] Écrire tests unitaires et d'intégration
- [ ] Documenter les endpoints dans README
- [ ] Tester manuellement avec Postman/Insomnia

---

## Best Practices

1. **Toujours utiliser transactions Prisma pour opérations multiples**
   ```typescript
   await prisma.$transaction([
     prisma.user.update(...),
     prisma.patient.update(...),
   ])
   ```

2. **Cache Redis pour données fréquemment lues**
   ```typescript
   const cached = await CacheService.get(key)
   if (cached) return cached
   // ... query DB
   await CacheService.set(key, data, 300)
   ```

3. **Pagination systématique pour listes**
   ```typescript
   const { skip, take, page, limit } = PaginationHelper.getPaginationParams(query)
   ```

4. **Gestion d'erreurs cohérente**
   ```typescript
   try {
     // operation
   } catch (error) {
     return ApiResponse.error(res, (error as Error).message)
   }
   ```

5. **Notifications asynchrones (pas de blocage)**
   ```typescript
   Promise.all([
     NotificationService.send(...),
     EmailService.send(...),
   ]).catch(logger.error)
   ```

---

## Next Steps

1. Implémenter tous les modules en suivant ces templates
2. Compléter les tests
3. Déployer sur Railway
4. Créer l'app mobile React Native (Expo)
5. Créer le dashboard admin (Next.js)
