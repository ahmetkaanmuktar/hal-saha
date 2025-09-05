'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatTime } from '@/lib/date-utils'

const formSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(50, 'İsim en fazla 50 karakter olabilir'),
  phone: z.string().min(10, 'Telefon numarası en az 10 haneli olmalı').max(11, 'Telefon numarası en fazla 11 haneli olabilir'),
  note: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

interface BookingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSlot: {
    date: string
    start: string
    end: string
  } | null
  onBookingSuccess: (result: any) => void
}

export function BookingDrawer({ open, onOpenChange, selectedSlot, onBookingSuccess }: BookingDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      note: ''
    }
  })

  const onSubmit = async (data: FormData) => {
    if (!selectedSlot) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedSlot.date,
          start: selectedSlot.start,
          end: selectedSlot.end,
          ...data
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Rezervasyon yapılırken hata oluştu')
      }

      onBookingSuccess(result)
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedSlot) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-gradient-to-b from-white to-red-50">
        <DrawerHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-6 mx-auto shadow-xl">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                if (nextElement) nextElement.style.display = 'block'
              }}
            />
            <span className="text-2xl text-white hidden">⚽</span>
          </div>
          <DrawerTitle className="text-3xl font-bold text-red-800 mb-3">
            Randevu Al
          </DrawerTitle>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl inline-block shadow-lg">
            <span className="font-bold text-lg">
              📅 {formatDate(selectedSlot.date)} • ⏰ {formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}
            </span>
          </div>
        </DrawerHeader>

        <div className="px-6 pb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                  <span className="mr-2">👤</span>
                  Ad Soyad *
                </label>
                <Input
                  {...form.register('name')}
                  placeholder="Adınız ve soyadınız"
                  className="h-14 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/90 font-medium"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                  <span className="mr-2">📱</span>
                  Telefon *
                </label>
                <Input
                  {...form.register('phone')}
                  placeholder="05XX XXX XX XX"
                  type="tel"
                  className="h-14 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/90 font-medium"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                  <span className="mr-2">📝</span>
                  Not (Opsiyonel)
                </label>
                <Textarea
                  {...form.register('note')}
                  placeholder="Varsa eklemek istediğiniz not"
                  className="resize-none border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white/90 font-medium text-lg"
                  rows={4}
                />
              </div>
            </div>

            {error && (
              <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-2">❌</span>
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}

            <DrawerFooter className="px-0 pt-6">
              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 rounded-2xl" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Rezervasyon yapılıyor...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-3">🏟️</span>
                    Randevuyu Al
                  </div>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full h-12 text-gray-600 border-2 border-gray-200 hover:bg-gray-50"
                type="button"
              >
                İptal
              </Button>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
