'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CalendarDays, Settings, Ban, Search, Download } from 'lucide-react'
import { formatDate, formatDateTime, getTurkeyTime, getDayName } from '@/lib/date-utils'

interface Booking {
  id: string
  date: string
  slotStart: string
  slotEnd: string
  name: string
  phone: string
  note?: string
  status: string
  createdAt: string
}

interface DaySlots {
  date: string
  slots: Array<{
    start: string
    end: string
    status: string
    booking?: Booking
  }>
}

export function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(getTurkeyTime().format('YYYY-MM-DD'))
  const [daySlots, setDaySlots] = useState<DaySlots | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchDayData()
  }, [selectedDate])

  const fetchDayData = async () => {
    setLoading(true)
    try {
      // Günlük slotları al
      const slotsResponse = await fetch(`/api/slots?from=${selectedDate}&days=1`)
      const slotsData = await slotsResponse.json()
      
      // O günün rezervasyonlarını al
      const bookingsResponse = await fetch(`/api/admin/bookings?date=${selectedDate}`)
      const bookingsData = await bookingsResponse.json()
      
      if (slotsData[0]) {
        // Slot'lara rezervasyon bilgilerini ekle
        const enrichedSlots = slotsData[0].slots.map((slot: any) => {
          const booking = bookingsData.find((b: Booking) => b.slotStart === slot.start)
          return {
            ...slot,
            booking
          }
        })
        
        setDaySlots({
          date: slotsData[0].date,
          slots: enrichedSlots
        })
      }
      
      setBookings(bookingsData)
    } catch (error) {
      console.error('Veri alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status })
      })
      
      if (response.ok) {
        fetchDayData()
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Bekliyor</Badge>
      case 'CONFIRMED':
        return <Badge variant="default">Onaylandı</Badge>
      case 'CANCELED':
        return <Badge variant="destructive">İptal</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter(booking =>
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.phone.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full mr-4 shadow-lg">
              <span className="text-xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
              <p className="text-blue-100 text-lg">Halısaha rezervasyon yönetimi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calendar">
              <CalendarDays className="w-4 h-4 mr-2" />
              Günlük Takvim
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </TabsTrigger>
            <TabsTrigger value="blocked">
              <Ban className="w-4 h-4 mr-2" />
              Bloke Slotlar
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Arama
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Günlük Takvim</span>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                    <Button variant="outline" size="sm" onClick={fetchDayData}>
                      Yenile
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Yükleniyor...</p>
                ) : daySlots ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">
                      {formatDate(selectedDate)} - {getDayName(selectedDate)}
                    </h3>
                    
                    <div className="grid gap-4">
                      {daySlots.slots.map((slot) => (
                        <Card key={`${slot.start}-${slot.end}`} className={slot.booking ? 'border-blue-200' : ''}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold">
                                  {slot.start} - {slot.end}
                                </div>
                                {slot.booking ? (
                                  <div className="mt-2 space-y-1">
                                    <p><strong>İsim:</strong> {slot.booking.name}</p>
                                    <p><strong>Telefon:</strong> {slot.booking.phone}</p>
                                    {slot.booking.note && <p><strong>Not:</strong> {slot.booking.note}</p>}
                                    <p><strong>Oluşturma:</strong> {formatDateTime(slot.booking.createdAt)}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 mt-1">Boş slot</p>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                {slot.booking ? (
                                  <>
                                    {getStatusBadge(slot.booking.status)}
                                    {slot.booking.status === 'PENDING' && (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() => updateBookingStatus(slot.booking!.id, 'CONFIRMED')}
                                        >
                                          Onayla
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => updateBookingStatus(slot.booking!.id, 'CANCELED')}
                                        >
                                          İptal
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <Button size="sm" variant="outline">
                                    Bloke Et
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>Veri bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Saatleri Ayarları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Çalışma saatleri ayarları yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked">
            <Card>
              <CardHeader>
                <CardTitle>Bloke Edilen Slotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Bloke slot yönetimi yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Rezervasyon Arama</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    CSV İndir
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="İsim veya telefon ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="space-y-2">
                  {filteredBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p><strong>İsim:</strong> {booking.name}</p>
                            <p><strong>Telefon:</strong> {booking.phone}</p>
                            <p><strong>Tarih:</strong> {formatDate(booking.date)} {booking.slotStart}-{booking.slotEnd}</p>
                            {booking.note && <p><strong>Not:</strong> {booking.note}</p>}
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
