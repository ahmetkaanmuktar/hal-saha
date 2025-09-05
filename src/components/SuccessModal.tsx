'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { CheckCircle, Download, MessageCircle } from 'lucide-react'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: {
    summaryText: string
    whatsappLink: string
    ics: string
  } | null
}

export function SuccessModal({ open, onOpenChange, result }: SuccessModalProps) {
  if (!result) return null

  const downloadIcs = () => {
    const blob = new Blob([result.ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'randevu.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gradient-to-b from-red-50 to-white">
        <DrawerHeader className="text-center pb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-400 to-red-500 rounded-full mb-6 mx-auto shadow-xl animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <DrawerTitle className="text-4xl font-bold text-red-800 mb-3">
            🎉 Rezervasyon Başarılı!
          </DrawerTitle>
          <p className="text-red-600 text-xl font-medium">Randevunuz başarıyla oluşturuldu</p>
        </DrawerHeader>

        <div className="px-6 pb-8">
          <Card className="border-0 bg-gradient-to-r from-red-100 to-red-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-red-800 text-2xl flex items-center">
                <span className="mr-3">📋</span>
                Randevu Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 text-xl font-bold">{result.summaryText}</p>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-4">
            <Button
              onClick={() => window.open(result.whatsappLink, '_blank')}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 rounded-2xl"
              size="lg"
            >
              <MessageCircle className="w-7 h-7 mr-3" />
              WhatsApp ile Paylaş
            </Button>

            <Button
              variant="outline"
              onClick={downloadIcs}
              className="w-full h-12 text-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transform transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Takvime Ekle (.ics)
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              Kapat
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
