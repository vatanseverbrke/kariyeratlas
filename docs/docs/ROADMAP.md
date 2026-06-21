# KariyerAtlas Roadmap

## 1. Genel Yol Haritası

KariyerAtlas, kısa vadede teknik meslekler için yüksek kaliteli kariyer ve fırsat takip platformu olarak başlayacak; orta ve uzun vadede tüm meslek gruplarına genişleyebilecek ölçeklenebilir bir ürün mimarisiyle geliştirilecektir.

Platformun gelişimi dört ana faz üzerinden planlanmaktadır:

* Faz 0: Marka, ürün ve mimari hazırlık
* Faz 1: MVP geliştirme
* Faz 2: Otomasyon, yapay zekâ ve bildirim sistemleri
* Faz 3: Ölçekleme, mobil uygulama ve gelir modeli
* Faz 4: Tüm meslek gruplarına genişleme

---

## 2. Faz 0 — Hazırlık ve Temel Ürün Tasarımı

### Hedef

KariyerAtlas’ın ürün vizyonunu, marka kimliğini, teknik mimarisini ve geliştirme planını netleştirmek.

### Yapılacaklar

* Domain satın alma
* GitHub repository oluşturma
* Ürün dokümantasyonu hazırlama
* Product Brief hazırlanması
* PRD hazırlanması
* Roadmap hazırlanması
* Marka dili belirlenmesi
* İlk teknik mimari kararlarının alınması
* Veritabanı modelinin tasarlanması
* Kullanıcı tiplerinin netleştirilmesi
* MVP kapsamının belirlenmesi

### Durum

* kariyeratlas.com domaini alındı.
* GitHub repository oluşturuldu.
* Product Brief hazırlandı.
* PRD hazırlandı.
* Roadmap hazırlanıyor.

---

## 3. Faz 1 — MVP Geliştirme

### Hedef

KariyerAtlas’ın ilk çalışan web sürümünü yayına almak.

### Temel Özellikler

* Modern ana sayfa
* İlan ve fırsat listeleme sayfası
* İlan detay sayfası
* Meslek filtresi
* Şehir filtresi
* Fırsat türü filtresi
* Kamu / özel sektör / eğitim / yarışma ayrımı
* Temel admin paneli
* Manuel ilan ekleme
* Kaynak yönetimi
* İlk veri modeli
* İlk kullanıcı arayüzü
* kariyeratlas.com domainine bağlama

### Kullanılacak Teknolojiler

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* PostgreSQL
* Supabase
* Prisma
* Vercel
* Cloudflare

### MVP’de Öncelikli Meslekler

* Şehir ve Bölge Planlama
* Peyzaj Mimarlığı
* Mimarlık
* CBS / GIS
* Harita Mühendisliği
* İnşaat Mühendisliği
* Çevre Mühendisliği

### MVP’de Öncelikli Fırsat Türleri

* Kamu personel ilanları
* Belediye ilanları
* Özel sektör iş ilanları
* Staj ilanları
* Meslek odası duyuruları
* Eğitimler
* Yarışmalar
* Burslar
* Etkinlikler

---

## 4. Faz 2 — Otomasyon ve Veri Toplama

### Hedef

KariyerAtlas’ın fırsatları manuel değil, otomatik olarak takip edebilmesini sağlamak.

### Yapılacaklar

* Kamu kaynakları için crawler altyapısı
* Belediye duyuru sayfalarının takibi
* Meslek odası duyuru sayfalarının takibi
* PDF dosyalarından metin okuma
* Word dosyalarından metin okuma
* Excel dosyalarından veri okuma
* Yinelenen ilan tespiti
* Son başvuru tarihi algılama
* Kaynak güncelleme kontrolü
* Otomatik ilan sınıflandırma
* Hatalı veri kontrol sistemi

### İlk Takip Edilecek Kaynak Grupları

* Belediyeler
* Büyükşehir belediyeleri
* Belediye iştirakleri
* Bakanlıklar
* İŞKUR
* Yerel Yönetimler Genel Müdürlüğü
* Meslek odaları
* Üniversiteler
* Kalkınma ajansları
* Özel sektör kariyer sayfaları

---

## 5. Faz 3 — Yapay Zekâ ve Bildirim Sistemleri

### Hedef

KariyerAtlas’ı yalnızca ilan listeleyen değil, ilanları anlayan ve kullanıcıya kişisel öneriler sunan akıllı bir platforma dönüştürmek.

### Yapay Zekâ Özellikleri

* İlan özeti çıkarma
* İlanın hangi mesleklere uygun olduğunu belirleme
* Gerekli becerileri çıkarma
* Eğitim, deneyim ve belge şartlarını tespit etme
* KPSS şartı algılama
* Son başvuru tarihini analiz etme
* Kullanıcı profiliyle ilan uygunluğu hesaplama
* Eksik beceri önerisi sunma
* Benzer ilan önerileri üretme

### Bildirim Özellikleri

* E-posta bildirimi
* Telegram bildirimi
* Web push bildirimi
* Mobil push bildirimi
* Son başvuru tarihi hatırlatması
* Favori kurum bildirimi
* Meslek bazlı fırsat bildirimi
* Şehir bazlı fırsat bildirimi

---

## 6. Faz 4 — Kullanıcı, İşveren ve Premium Sistem

### Hedef

Platformu bireysel kullanıcılar, işverenler ve kurumlar için tam kapsamlı kariyer ekosistemine dönüştürmek.

### Kullanıcı Özellikleri

* Kullanıcı hesabı
* Profil oluşturma
* Meslek seçimi
* Şehir tercihi
* Bildirim tercihleri
* Favori ilanlar
* Başvuru takibi
* CV yükleme
* CV analizi
* Kişisel kariyer paneli

### İşveren Özellikleri

* Kurum hesabı
* Kurum profili
* İlan yayınlama
* Başvuru alma
* Aday filtreleme
* İlan performans raporu
* Öne çıkarılmış ilan
* Kurumsal abonelik

### Premium Özellikler

* CV-ilan eşleştirme
* Gelişmiş yapay zekâ analizi
* Uygunluk yüzdesi
* Erken bildirim
* Gelişmiş filtreler
* Kişisel kariyer önerileri
* Eğitim ve beceri önerileri

---

## 7. Faz 5 — Mobil Uygulama

### Hedef

KariyerAtlas’ı Android ve iOS cihazlarda kullanılabilir hale getirmek.

### Mobil Özellikler

* Kullanıcı girişi
* Kişisel ilan akışı
* Push bildirimleri
* Favori ilanlar
* Başvuru takibi
* Meslek ve şehir filtreleri
* Harita tabanlı keşif
* Yapay zekâ destekli ilan özeti
* Son başvuru hatırlatmaları

### Teknoloji

* React Native
* Expo veya native build yapısı
* Supabase entegrasyonu
* Push notification altyapısı

---

## 8. Faz 6 — Tüm Mesleklere Genişleme

### Hedef

KariyerAtlas’ı yalnızca teknik meslekler için değil, tüm meslek grupları için kullanılabilir hale getirmek.

### Genişletilecek Alanlar

* Sağlık
* Hukuk
* Eğitim
* Finans
* Yazılım
* Sosyal bilimler
* İdari bilimler
* İletişim
* Tasarım
* Yaratıcı sektörler
* Turizm
* Lojistik
* Üretim
* İnsan kaynakları
* Satış ve pazarlama

### Uzun Vadeli Hedef

KariyerAtlas’ın Türkiye’de iş, kariyer, kamu alımı, eğitim, yarışma, burs ve mesleki fırsat takibi alanında güvenilir, ölçeklenebilir ve akıllı bir platform haline gelmesi hedeflenmektedir.

---

## 9. İlk 90 Günlük Plan

### İlk 30 Gün

* Ürün dokümantasyonunun tamamlanması
* Teknik mimari kararlarının kesinleşmesi
* Tasarım sistemi taslağının hazırlanması
* Veritabanı şemasının çıkarılması
* Next.js proje iskeletinin kurulması
* Ana sayfa taslağının hazırlanması

### 30–60 Gün

* İlan listeleme sayfasının geliştirilmesi
* İlan detay sayfasının geliştirilmesi
* Admin panel temel iskeletinin oluşturulması
* Manuel ilan ekleme sisteminin yapılması
* İlk kaynak veri modelinin kurulması
* İlk crawler prototipinin hazırlanması

### 60–90 Gün

* PDF okuma sisteminin eklenmesi
* Bildirim altyapısının kurulması
* İlk yapay zekâ ilan özeti prototipinin geliştirilmesi
* İlk test veri setinin girilmesi
* Vercel deploy yapılması
* kariyeratlas.com domaininin bağlanması
* Kapalı beta test sürecinin başlatılması

---

## 10. Başarı Hedefleri

### Kısa Vadeli Hedefler

* İlk çalışan web sürümünü yayına almak
* İlk 100 kaliteli ilan / fırsat kaydını oluşturmak
* İlk 25 güvenilir kaynağı takip etmek
* İlk kullanıcı testlerini yapmak

### Orta Vadeli Hedefler

* 1.000 kullanıcıya ulaşmak
* 500+ aktif fırsat veritabanı oluşturmak
* Otomatik veri toplama sistemini kararlı hale getirmek
* Yapay zekâ destekli ilan özetlerini aktif etmek
* E-posta ve Telegram bildirimlerini çalıştırmak

### Uzun Vadeli Hedefler

* 100.000+ kullanıcıya hizmet verebilecek altyapı kurmak
* Mobil uygulama yayınlamak
* İşveren paneli geliştirmek
* Premium üyelik sistemini başlatmak
* Tüm meslek gruplarına genişlemek
* Türkiye’nin önemli kariyer ve fırsat platformlarından biri olmak
