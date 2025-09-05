import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Mevcut verileri temizle
  await prisma.openingHours.deleteMany()

  // Haftalık çalışma saatlerini ekle (Pazartesi=1, Salı=2, ..., Pazar=0)
  const openingHours = [
    { dow: 1, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Pazartesi
    { dow: 2, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Salı
    { dow: 3, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Çarşamba
    { dow: 4, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Perşembe
    { dow: 5, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Cuma
    { dow: 6, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Cumartesi
    { dow: 0, openTime: '09:00', closeTime: '03:00', slotMinutes: 60 }, // Pazar
  ]

  for (const hours of openingHours) {
    await prisma.openingHours.create({
      data: hours,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
