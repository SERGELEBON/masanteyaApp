import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const passwordHash = await bcrypt.hash('Password123!', 12)

  const patientGH = await prisma.user.create({
    data: {
      email: 'patient.gh@test.com',
      phone: '+233501234567',
      passwordHash,
      firstName: 'Kwame',
      lastName: 'Mensah',
      role: 'PATIENT',
      country: 'GH',
      city: 'Accra',
      bloodGroup: 'O_POS',
      isEmailVerified: true,
      isPhoneVerified: true,
      patientProfile: {
        create: {
          allergies: ['Penicillin'],
          chronicConditions: ['Hypertension'],
        },
      },
    },
  })

  const patientGN = await prisma.user.create({
    data: {
      email: 'patient.gn@test.com',
      phone: '+224621234567',
      passwordHash,
      firstName: 'Fatoumata',
      lastName: 'Diallo',
      role: 'PATIENT',
      country: 'GN',
      city: 'Conakry',
      bloodGroup: 'A_POS',
      isEmailVerified: true,
      isPhoneVerified: true,
      patientProfile: {
        create: {
          allergies: [],
          chronicConditions: ['Diabetes'],
        },
      },
    },
  })

  const doctorGH = await prisma.user.create({
    data: {
      email: 'doctor.gh@test.com',
      phone: '+233241234567',
      passwordHash,
      firstName: 'Dr. Ama',
      lastName: 'Asante',
      role: 'DOCTOR',
      country: 'GH',
      city: 'Kumasi',
      isEmailVerified: true,
      isPhoneVerified: true,
      doctorProfile: {
        create: {
          specialty: 'Cardiologie',
          licenseNumber: 'GH-DOC-12345',
          hospital: 'Komfo Anokye Teaching Hospital',
          city: 'Kumasi',
          country: 'GH',
          consultationFee: 150,
          currency: 'GHS',
          acceptsNHIS: true,
          languages: ['English', 'Twi'],
          yearsExperience: 10,
          bio: 'Cardiologue expérimenté avec 10 ans de pratique',
          availabilities: {
            create: [
              { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
              { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isActive: true },
            ],
          },
        },
      },
    },
  })

  const doctorGN = await prisma.user.create({
    data: {
      email: 'doctor.gn@test.com',
      phone: '+224601234567',
      passwordHash,
      firstName: 'Dr. Mamadou',
      lastName: 'Bah',
      role: 'DOCTOR',
      country: 'GN',
      city: 'Conakry',
      isEmailVerified: true,
      isPhoneVerified: true,
      doctorProfile: {
        create: {
          specialty: 'Médecine générale',
          licenseNumber: 'GN-DOC-54321',
          hospital: 'Hôpital National Donka',
          city: 'Conakry',
          country: 'GN',
          consultationFee: 50000,
          currency: 'GNF',
          acceptsNHIS: false,
          languages: ['French', 'Fula'],
          yearsExperience: 8,
          bio: 'Médecin généraliste dévoué',
        },
      },
    },
  })

  const pharmaciesGH = await prisma.pharmacy.createMany({
    data: [
      {
        name: 'Pharmacy Plus - Accra',
        address: 'Oxford Street, Osu',
        city: 'Accra',
        country: 'GH',
        phone: '+233302123456',
        latitude: 5.556818,
        longitude: -0.187436,
        isOpen: true,
        isOnDuty: false,
        openingHours: '08:00-20:00',
        acceptsNHIS: true,
        isVerified: true,
      },
      {
        name: 'MedCare Pharmacy - Kumasi',
        address: 'Adum, Kumasi',
        city: 'Kumasi',
        country: 'GH',
        phone: '+233322012345',
        latitude: 6.688087,
        longitude: -1.624997,
        isOpen: true,
        isOnDuty: true,
        openingHours: '24/7',
        acceptsNHIS: true,
        isVerified: true,
      },
    ],
  })

  const pharmaciesGN = await prisma.pharmacy.createMany({
    data: [
      {
        name: 'Pharmacie Centrale - Conakry',
        address: 'Avenue de la République, Kaloum',
        city: 'Conakry',
        country: 'GN',
        phone: '+224621112233',
        latitude: 9.509167,
        longitude: -13.712222,
        isOpen: true,
        isOnDuty: false,
        openingHours: '08:00-19:00',
        acceptsNHIS: false,
        isVerified: true,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📧 Test accounts:')
  console.log('Ghana Patient: patient.gh@test.com / Password123!')
  console.log('Guinea Patient: patient.gn@test.com / Password123!')
  console.log('Ghana Doctor: doctor.gh@test.com / Password123!')
  console.log('Guinea Doctor: doctor.gn@test.com / Password123!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })