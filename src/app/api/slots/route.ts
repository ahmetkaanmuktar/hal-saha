import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slotsQuerySchema } from '@/lib/validations'
import { getTurkeyTime, generateTimeSlots, isTimeSlotPast } from '@/lib/date-utils'
import dayjs from 'dayjs'

function getDemoSlots(fromDate: string, dayCount: number) {
  const startDate = getTurkeyTime(fromDate).startOf('day')
  const result = []

  for (let i = 0; i < dayCount; i++) {
    const currentDate = startDate.add(i, 'day')
    const dateStr = currentDate.format('YYYY-MM-DD')
    
    // Demo slot'lar üret (09:00-03:00)
    const timeSlots = generateTimeSlots('09:00', '03:00', 60)
    
    const slots = timeSlots.map(slot => ({
      start: slot.start,
      end: slot.end,
      status: isTimeSlotPast(dateStr, slot.start) ? 'past' : 'available'
    }))

    result.push({
      date: dateStr,
      slots
    })
  }

  return result
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const days = searchParams.get('days') || '15'

    const query = slotsQuerySchema.safeParse({ from, days })
    if (!query.success) {
      return NextResponse.json(
        { error: 'Geçersiz parametreler', details: query.error.errors },
        { status: 400 }
      )
    }

    // Vercel'de veritabanı sorunu varsa demo data döndür
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy')) {
      return NextResponse.json(getDemoSlots(query.data.from, query.data.days))
    }

    const { from: fromDate, days: dayCount } = query.data
    const startDate = getTurkeyTime(fromDate).startOf('day')
    const result = []

    // Her gün için slot'ları üret
    for (let i = 0; i < dayCount; i++) {
      const currentDate = startDate.add(i, 'day')
      const dateStr = currentDate.format('YYYY-MM-DD')
      const dayOfWeek = currentDate.day()

      // O günün çalışma saatlerini bul
      const openingHours = await prisma.openingHours.findUnique({
        where: { dow: dayOfWeek }
      })

      if (!openingHours) {
        result.push({
          date: dateStr,
          slots: []
        })
        continue
      }

      // Time slot'larını üret
      const timeSlots = generateTimeSlots(
        openingHours.openTime,
        openingHours.closeTime,
        openingHours.slotMinutes
      )

      // Mevcut rezervasyonları al
      const bookings = await prisma.booking.findMany({
        where: {
          date: currentDate.toDate(),
          status: { in: ['PENDING', 'CONFIRMED'] }
        },
        select: { slotStart: true }
      })

      // Bloke edilen slot'ları al
      const blockedSlots = await prisma.blockedSlot.findMany({
        where: {
          date: currentDate.toDate()
        },
        select: { slotStart: true }
      })

      const bookedTimes = new Set(bookings.map(b => b.slotStart))
      const blockedTimes = new Set(blockedSlots.map(b => b.slotStart))

      // Slot'ları durumlarıyla birlikte döndür
      const slots = timeSlots.map(slot => {
        let status = 'available'
        
        if (blockedTimes.has(slot.start)) {
          status = 'blocked'
        } else if (bookedTimes.has(slot.start)) {
          status = 'booked'
        } else if (isTimeSlotPast(dateStr, slot.start)) {
          status = 'past'
        }

        return {
          start: slot.start,
          end: slot.end,
          status
        }
      })

      result.push({
        date: dateStr,
        slots
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Slots API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
