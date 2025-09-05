import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingSchema } from '@/lib/validations'
import { getTurkeyTime, isTimeSlotPast } from '@/lib/date-utils'
import dayjs from 'dayjs'

// Rate limiting (basit in-memory implementasyon)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 dakika
  const maxRequests = 10

  const current = rateLimitMap.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen 10 dakika sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = bookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { date, start, end, name, phone, note } = validation.data

    // Tarih kontrolü - geçmiş tarih ve 15 günlük pencere
    const bookingDate = getTurkeyTime(date).startOf('day')
    const today = getTurkeyTime().startOf('day')
    const maxDate = today.add(15, 'day')

    if (bookingDate.isBefore(today) || bookingDate.isAfter(maxDate)) {
      return NextResponse.json(
        { error: 'Geçersiz tarih. Sadece bugünden itibaren 15 gün içindeki tarihler için rezervasyon yapılabilir.' },
        { status: 400 }
      )
    }

    // Geçmiş saat kontrolü
    if (isTimeSlotPast(date, start)) {
      return NextResponse.json(
        { error: 'Geçmiş saatler için rezervasyon yapılamaz.' },
        { status: 400 }
      )
    }

    // Çalışma saatleri kontrolü
    const dayOfWeek = bookingDate.day()
    const openingHours = await prisma.openingHours.findUnique({
      where: { dow: dayOfWeek }
    })

    if (!openingHours) {
      return NextResponse.json(
        { error: 'Bu gün için çalışma saati tanımlanmamış.' },
        { status: 400 }
      )
    }

    // Slot'un çalışma saatleri içinde olup olmadığını kontrol et
    const slotStart = dayjs(`2000-01-01 ${start}`)
    const slotEnd = dayjs(`2000-01-01 ${end}`)
    const workStart = dayjs(`2000-01-01 ${openingHours.openTime}`)
    const workEnd = dayjs(`2000-01-01 ${openingHours.closeTime}`)

    if (slotStart.isBefore(workStart) || slotEnd.isAfter(workEnd)) {
      return NextResponse.json(
        { error: 'Seçilen saat çalışma saatleri dışında.' },
        { status: 400 }
      )
    }

    // Bloke slot kontrolü
    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        date: bookingDate.toDate(),
        slotStart: start
      }
    })

    if (blockedSlot) {
      return NextResponse.json(
        { error: 'Bu saat dilimi bloke edilmiş.' },
        { status: 400 }
      )
    }

    // Rezervasyon oluştur (unique constraint sayesinde çakışma kontrolü otomatik)
    try {
      const booking = await prisma.booking.create({
        data: {
          date: bookingDate.toDate(),
          slotStart: start,
          slotEnd: end,
          name,
          phone,
          note: note || null,
          status: 'PENDING'
        }
      })

      // Başarı mesajı ve WhatsApp linki
      const summaryText = `Halısaha Randevunuz: ${date} ${start}-${end} - ${name} - ${phone}`
      const whatsappText = encodeURIComponent(summaryText)
      const whatsappLink = `https://wa.me/?text=${whatsappText}`

      // .ics dosya içeriği
      const icsContent = generateIcsContent(booking, summaryText)

      return NextResponse.json({
        ok: true,
        bookingId: booking.id,
        summaryText,
        whatsappLink,
        ics: icsContent
      })

    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Bu saat dilimi zaten rezerve edilmiş.' },
          { status: 409 }
        )
      }
      throw error
    }

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

function generateIcsContent(booking: any, summary: string): string {
  const startDateTime = dayjs(`${booking.date.toISOString().split('T')[0]} ${booking.slotStart}`)
    .tz('Europe/Istanbul')
    .format('YYYYMMDDTHHmmss')
  
  const endDateTime = dayjs(`${booking.date.toISOString().split('T')[0]} ${booking.slotEnd}`)
    .tz('Europe/Istanbul')
    .format('YYYYMMDDTHHmmss')

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Halısaha Randevu//TR
BEGIN:VEVENT
UID:${booking.id}@halisaha
DTSTART;TZID=Europe/Istanbul:${startDateTime}
DTEND;TZID=Europe/Istanbul:${endDateTime}
SUMMARY:${summary}
DESCRIPTION:Halısaha Randevusu - ${booking.name}
LOCATION:Ardıçlı Mah. Halı Saha
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}
