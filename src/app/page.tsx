'use client'

import { useState, useEffect } from 'react'
import { Phone, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BookingDrawer } from '@/components/BookingDrawer'
import { SuccessModal } from '@/components/SuccessModal'
import { getNext15Days, formatDate, getDayName } from '@/lib/date-utils'

interface TimeSlot {
  start: string
  end: string
  status: 'available' | 'booked' | 'blocked' | 'past'
}

interface DaySlots {
  date: string
  slots: TimeSlot[]
}

export default function HomePage() {
  const [days] = useState(() => getNext15Days())
  const [selectedDate, setSelectedDate] = useState(days[0]?.date || '')
  const [slotsData, setSlotsData] = useState<DaySlots[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, start: string, end: string} | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/slots?from=${days[0].date}&days=15`)
      const data = await response.json()
      setSlotsData(data)
    } catch (error) {
      console.error('Slot verisi alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (date: string, slot: TimeSlot) => {
    if (slot.status !== 'available') return
    
    setSelectedSlot({
      date,
      start: slot.start,
      end: slot.end
    })
    setDrawerOpen(true)
  }

  const handleBookingSuccess = (result: any) => {
    setBookingResult(result)
    setSuccessModalOpen(true)
    fetchSlots() // Slotları yenile
  }

  const getSlotVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default'
      case 'booked':
        return 'secondary'
      case 'blocked':
        return 'destructive'
      case 'past':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getSlotText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Müsait'
      case 'booked':
        return 'Dolu'
      case 'blocked':
        return 'Bloke'
      case 'past':
        return 'Geçti'
      default:
        return 'Müsait'
    }
  }

  const selectedDaySlots = slotsData.find(d => d.date === selectedDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-xl">
              <img 
                src="/logo.png" 
                alt="Halısaha Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                  if (nextElement) nextElement.style.display = 'block'
                }}
              />
              <span className="text-2xl hidden">⚽</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Ardıçlı Mah. Halı Saha
            </h1>
            <p className="text-blue-100 text-xl mb-8 font-medium">
              Profesyonel Halısaha Deneyimi
            </p>
            
            <div className="flex justify-center gap-4">
              <Button variant="secondary" size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 border-0 hover:from-yellow-500 hover:to-yellow-600 shadow-lg font-bold px-8">
                <Phone className="w-5 h-5 mr-2" />
                <a href="tel:+905XXXXXXXXX">Hemen Ara</a>
              </Button>
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 border border-white/30 font-semibold">
                <Info className="w-5 h-5 mr-2" />
                Bilgi
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tarih Seçimi */}
        <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-blue-900 flex items-center">
              <span className="mr-3">📅</span>
              Tarih Seçin
            </CardTitle>
            <p className="text-blue-700 text-base">Rezervasyon yapmak istediğiniz tarihi seçin</p>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={selectedDate} onValueChange={setSelectedDate}>
              <TabsList className="grid grid-cols-3 gap-3 h-auto p-3 md:flex md:flex-wrap bg-blue-50/50 rounded-xl">
                {days.map((day) => (
                  <TabsTrigger
                    key={day.date}
                    value={day.date}
                    className={`flex flex-col p-5 h-auto rounded-xl transition-all duration-300 ${
                      day.isToday 
                        ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-800 data-[state=active]:to-blue-900 data-[state=active]:text-white border-2 border-yellow-400 shadow-lg' 
                        : 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700 data-[state=active]:to-blue-800 data-[state=active]:text-white'
                    } hover:bg-white hover:shadow-lg hover:scale-105`}
                  >
                    <span className="text-xs font-semibold opacity-80">{day.dayName}</span>
                    <span className="font-bold text-xl">{day.display}</span>
                    {day.isToday && <span className="text-xs bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold mt-1">BUGÜN</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Saat Slotları */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-blue-900 flex items-center">
              <span className="mr-3">⏰</span>
              {selectedDate && `${formatDate(selectedDate)} - ${getDayName(selectedDate)}`}
            </CardTitle>
            <p className="text-blue-700 text-base">Müsait olan saatlere tıklayarak randevu alabilirsiniz</p>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <p className="mt-6 text-red-600 text-lg font-medium">Saatler yükleniyor...</p>
              </div>
            ) : selectedDaySlots ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedDaySlots.slots.map((slot) => (
                  <Button
                    key={`${slot.start}-${slot.end}`}
                    variant={slot.status === 'available' ? 'default' : 'outline'}
                    className={`h-auto p-6 flex flex-col transition-all duration-300 transform hover:scale-110 rounded-xl ${
                      slot.status === 'available' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl border-0' 
                        : slot.status === 'booked'
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed border-gray-300'
                        : slot.status === 'blocked'
                        ? 'bg-red-100 text-red-700 cursor-not-allowed border-red-300'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                    }`}
                    disabled={slot.status !== 'available'}
                    onClick={() => handleSlotClick(selectedDate, slot)}
                  >
                    <span className="font-bold text-xl mb-3">
                      {slot.start}
                    </span>
                    <span className="font-semibold text-lg mb-2">
                      {slot.end}
                    </span>
                    <Badge 
                      variant={getSlotVariant(slot.status)}
                      className={`text-xs font-bold px-3 py-1 ${
                        slot.status === 'available' 
                          ? 'bg-white/25 text-white border-white/40' 
                          : slot.status === 'booked'
                          ? 'bg-gray-600 text-white'
                          : slot.status === 'blocked'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {getSlotText(slot.status)}
                    </Badge>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🏟️</div>
                <p className="text-red-600 text-xl font-medium">Bu gün için saat bilgisi bulunamadı.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Drawer */}
      <BookingDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedSlot={selectedSlot}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        result={bookingResult}
      />
    </div>
  )
}
