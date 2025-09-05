import { z } from 'zod'

export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih giriniz'),
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Geçerli bir saat giriniz'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Geçerli bir saat giriniz'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalı').max(50, 'İsim en fazla 50 karakter olabilir'),
  phone: z.string().min(10, 'Telefon numarası en az 10 haneli olmalı').max(11, 'Telefon numarası en fazla 11 haneli olabilir'),
  note: z.string().optional()
})

export const cancelBookingSchema = z.object({
  bookingId: z.string().optional(),
  date: z.string().optional(),
  start: z.string().optional()
}).refine(
  (data) => data.bookingId || (data.date && data.start),
  { message: 'Rezervasyon ID veya tarih/saat bilgisi gerekli' }
)

export const slotsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih giriniz'),
  days: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(30))
})

export type BookingInput = z.infer<typeof bookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type SlotsQuery = z.infer<typeof slotsQuerySchema>
