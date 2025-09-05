import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/tr'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('tr')

export const TIMEZONE = 'Europe/Istanbul'

export function getTurkeyTime(date?: string | Date) {
  return dayjs(date).tz(TIMEZONE)
}

export function formatDate(date: string | Date) {
  return getTurkeyTime(date).format('DD.MM.YYYY')
}

export function formatTime(time: string) {
  return time
}

export function formatDateTime(date: string | Date) {
  return getTurkeyTime(date).format('DD.MM.YYYY HH:mm')
}

export function getDayName(date: string | Date) {
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  return dayNames[getTurkeyTime(date).day()]
}

export function getNext15Days() {
  const today = getTurkeyTime().startOf('day')
  const days = []
  
  for (let i = 0; i < 15; i++) {
    const date = today.add(i, 'day')
    days.push({
      date: date.format('YYYY-MM-DD'),
      display: date.format('DD.MM'),
      dayName: getDayName(date.toDate()),
      isToday: i === 0,
      dayOfWeek: date.day()
    })
  }
  
  return days
}

export function generateTimeSlots(openTime: string, closeTime: string, slotMinutes: number) {
  const slots = []
  const start = dayjs(`2000-01-01 ${openTime}`)
  let end = dayjs(`2000-01-01 ${closeTime}`)
  
  // Eğer kapanış saati açılış saatinden küçükse (gece geçen saatler için), ertesi gün olarak hesapla
  if (end.isBefore(start)) {
    end = end.add(1, 'day')
  }
  
  let current = start
  while (current.isBefore(end)) {
    const slotEnd = current.add(slotMinutes, 'minute')
    if (slotEnd.isAfter(end)) break
    
    slots.push({
      start: current.format('HH:mm'),
      end: slotEnd.format('HH:mm')
    })
    
    current = slotEnd
  }
  
  return slots
}

export function isTimeSlotPast(date: string, timeStart: string) {
  const slotDateTime = dayjs(`${date} ${timeStart}`).tz(TIMEZONE)
  const now = getTurkeyTime()
  return slotDateTime.isBefore(now)
}
