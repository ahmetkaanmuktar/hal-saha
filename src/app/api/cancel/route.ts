import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancelBookingSchema } from '@/lib/validations'
import { getTurkeyTime } from '@/lib/date-utils'

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
    const validation = cancelBookingSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { bookingId, date, start } = validation.data

    let booking

    // Rezervasyonu bul
    if (bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      })
    } else if (date && start) {
      const bookingDate = getTurkeyTime(date).startOf('day').toDate()
      booking = await prisma.booking.findUnique({
        where: {
          date_slotStart: {
            date: bookingDate,
            slotStart: start
          }
        }
      })
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Rezervasyon bulunamadı.' },
        { status: 404 }
      )
    }

    if (booking.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Bu rezervasyon zaten iptal edilmiş.' },
        { status: 400 }
      )
    }

    // Rezervasyonu iptal et
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELED' }
    })

    return NextResponse.json({
      ok: true,
      message: 'Rezervasyon başarıyla iptal edildi.'
    })

  } catch (error) {
    console.error('Cancel API error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
