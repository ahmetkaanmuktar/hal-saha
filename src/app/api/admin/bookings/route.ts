import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTurkeyTime } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const phone = searchParams.get('phone')
    const name = searchParams.get('name')

    let whereClause: any = {}

    if (date) {
      const bookingDate = getTurkeyTime(date).startOf('day').toDate()
      whereClause.date = bookingDate
    }

    if (phone) {
      whereClause.phone = { contains: phone }
    }

    if (name) {
      whereClause.name = { contains: name, mode: 'insensitive' }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: [
        { date: 'asc' },
        { slotStart: 'asc' }
      ]
    })

    // Tarihleri string formatına çevir
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      date: booking.date.toISOString().split('T')[0],
      createdAt: booking.createdAt.toISOString()
    }))

    return NextResponse.json(formattedBookings)
  } catch (error) {
    console.error('Admin bookings GET error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, name, phone, note } = body

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID gerekli' }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (note !== undefined) updateData.note = note

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    })

    return NextResponse.json({
      ...booking,
      date: booking.date.toISOString().split('T')[0],
      createdAt: booking.createdAt.toISOString()
    })
  } catch (error: any) {
    console.error('Admin bookings PATCH error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
