# Ardıçlı Mah. Halı Saha Randevu Sistemi

Modern, mobil-öncelikli halısaha randevu sistemi. Next.js 14, TypeScript, Tailwind CSS ve Prisma ile geliştirilmiştir.

## Özellikler

### Kullanıcı Özellikleri
- 📱 Mobil-öncelikli tasarım
- 📅 15 günlük randevu takvimi
- ⏰ Saat bazlı slot sistemi
- 📝 Kolay rezervasyon formu
- 📱 WhatsApp paylaşım entegrasyonu
- 📥 .ics dosya indirme (takvime ekleme)
- 🔒 Form doğrulama ve güvenlik

### Admin Özellikleri
- 🔐 Şifre korumalı admin paneli
- 📊 Günlük rezervasyon yönetimi
- ✅ Rezervasyon onaylama/iptal etme
- 🔍 Müşteri arama ve filtreleme
- 📈 Rezervasyon durumu takibi
- ⚙️ Çalışma saatleri yönetimi (gelecek)
- 🚫 Slot bloklama sistemi (gelecek)

## Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Veritabanı:** Prisma ORM + SQLite (geliştirme)
- **Form Yönetimi:** React Hook Form + Zod
- **Tarih/Saat:** dayjs + timezone
- **UI Bileşenleri:** Radix UI + shadcn/ui

## Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Environment dosyasını oluşturun:**
   ```bash
   # .env.local dosyası oluşturun ve aşağıdaki değerleri ekleyin:
   DATABASE_URL="file:./dev.db"
   ADMIN_PASSWORD="admin123"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

3. **Veritabanını kurun:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run db:seed
   ```

4. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

5. **Projeyi tarayıcıda açın:**
   - Ana sayfa: http://localhost:3000
   - Admin paneli: http://localhost:3000/admin (Şifre: admin123)

## Kullanılabilir Scriptler

- `npm run dev` - Geliştirme sunucusunu başlatır
- `npm run build` - Prodüksiyon için build alır
- `npm run start` - Prodüksiyon sunucusunu başlatır
- `npm run prisma:migrate` - Veritabanı migration'larını çalıştırır
- `npm run prisma:generate` - Prisma client'ını generate eder
- `npm run db:seed` - Veritabanını başlangıç verileriyle doldurur

## Kullanım

### Müşteri Randevu Alma
1. Ana sayfada tarih seçin
2. Müsait olan saat slotuna tıklayın
3. Ad, soyad ve telefon bilgilerinizi girin
4. Randevunuzu alın
5. WhatsApp ile paylaşın veya takvime ekleyin

### Admin Yönetimi
1. `/admin` sayfasına gidin
2. Admin şifresi ile giriş yapın (varsayılan: admin123)
3. Günlük takvimde rezervasyonları görüntüleyin
4. Rezervasyonları onaylayın/iptal edin
5. Müşteri bilgilerini arayın

## Konfigürasyon

### Çalışma Saatleri
Varsayılan çalışma saatleri: 09:00 - 23:00 (Her gün)
Slot süresi: 60 dakika

Bu ayarlar veritabanındaki `OpeningHours` tablosundan yönetilir.

### Admin Şifresi
Environment değişkeni `ADMIN_PASSWORD` ile ayarlanır.

### Rate Limiting
API endpoint'leri için basit in-memory rate limiting:
- `/api/book` ve `/api/cancel`: 10 istek/10 dakika per IP

## Veritabanı Şeması

- **Booking:** Rezervasyon bilgileri
- **OpeningHours:** Haftalık çalışma saatleri
- **BlockedSlot:** Bloke edilen saat dilimleri

## Prodüksiyon Dağıtımı

1. Environment değişkenlerini ayarlayın
2. PostgreSQL veritabanı bağlantısı için `DATABASE_URL` güncelleyin
3. Prisma şemasında provider'ı `postgresql` olarak değiştirin
4. Migration'ları çalıştırın
5. Build alın ve deploy edin

## Güvenlik

- Form doğrulama (Zod)
- Rate limiting
- Admin paneli şifre koruması
- SQL injection koruması (Prisma)
- XSS koruması (Next.js built-in)

## Destek

Herhangi bir sorun için GitHub issues bölümünü kullanabilirsiniz.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
