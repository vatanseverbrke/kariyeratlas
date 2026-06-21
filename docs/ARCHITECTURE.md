# KariyerAtlas Architecture

## 1. Mimari Yaklaşım

KariyerAtlas, uzun vadede yüksek kullanıcı sayısına, çok sayıda veri kaynağına, otomatik ilan tarama sistemine, yapay zekâ destekli analizlere ve mobil uygulama desteğine sahip olacak şekilde ölçeklenebilir bir mimariyle tasarlanacaktır.

Platform başlangıçta modüler monolit yaklaşımla geliştirilecek, ihtiyaç arttıkça belirli servisler bağımsız mikroservislere ayrılabilecektir.

İlk hedef; hızlı geliştirilebilir, güvenli, bakımı kolay ve ileride büyümeye açık bir temel oluşturmaktır.

---

## 2. Ana Sistem Bileşenleri

KariyerAtlas aşağıdaki ana bileşenlerden oluşacaktır:

* Web uygulaması
* Admin paneli
* API katmanı
* Veritabanı
* Crawler ve veri toplama sistemi
* Doküman okuma sistemi
* Yapay zekâ analiz sistemi
* Bildirim sistemi
* Kimlik doğrulama sistemi
* Dosya depolama sistemi
* Loglama ve izleme sistemi

---

## 3. Teknoloji Yığını

### 3.1 Frontend

Web arayüzü için kullanılacak teknolojiler:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* TanStack Table
* React Hook Form
* Zod

Frontend uygulaması kullanıcı arayüzü, ilan listeleme, ilan detayları, filtreleme, kullanıcı paneli ve temel admin panelini kapsayacaktır.

---

### 3.2 Backend

İlk aşamada backend yapısı Next.js API routes veya server actions ile kurulacaktır. Sistem büyüdükçe bağımsız backend servisine geçilebilir.

Olası backend teknolojileri:

* Next.js API
* Node.js
* TypeScript
* İlerleyen aşamada NestJS

Backend şu işlevleri sağlayacaktır:

* Kullanıcı işlemleri
* İlan işlemleri
* Kaynak yönetimi
* Bildirim tercihleri
* Admin işlemleri
* AI analiz istekleri
* Crawler sonuçlarının işlenmesi

---

### 3.3 Veritabanı

Ana veritabanı olarak PostgreSQL kullanılacaktır.

Önerilen altyapı:

* Supabase PostgreSQL
* Prisma ORM
* Row Level Security
* Database migrations

Veritabanı şu ana veri gruplarını saklayacaktır:

* Kullanıcılar
* Kullanıcı profilleri
* Meslekler
* Şehirler
* İlanlar
* Fırsatlar
* Kaynaklar
* Kurumlar
* Bildirim tercihleri
* Favoriler
* Crawler logları
* AI analiz sonuçları

---

### 3.4 Kimlik Doğrulama

İlk aşamada Supabase Auth kullanılacaktır.

Desteklenecek giriş yöntemleri:

* E-posta ve şifre
* Magic link
* Google ile giriş
* İlerleyen aşamada LinkedIn ile giriş

Kullanıcı rolleri:

* Guest
* User
* Premium User
* Employer
* Institution
* Admin
* Super Admin

---

### 3.5 Crawler Sistemi

Crawler sistemi farklı kaynaklardan ilan ve fırsat verisi toplamak için kullanılacaktır.

Kullanılacak teknolojiler:

* Python
* Playwright
* BeautifulSoup
* Requests
* PyMuPDF
* python-docx
* openpyxl
* Pandas

Crawler yetenekleri:

* Web sayfası tarama
* PDF dosyası okuma
* Word dosyası okuma
* Excel dosyası okuma
* Link keşfi
* Anahtar kelime analizi
* Son başvuru tarihi tespiti
* Yinelenen ilan kontrolü
* Kaynak değişikliği takibi
* Aktif / süresi geçmiş ilan ayrımı

Crawler ilk aşamada zamanlanmış görevlerle çalışacaktır. İlerleyen aşamada ayrı bir worker servisine taşınabilir.

---

### 3.6 Yapay Zekâ Analiz Sistemi

Yapay zekâ modülü ilanların daha anlaşılır hale getirilmesi ve kullanıcıyla eşleştirilmesi için kullanılacaktır.

İlk aşama AI özellikleri:

* İlan özeti çıkarma
* Meslek uygunluğu belirleme
* Anahtar beceri çıkarımı
* KPSS şartı tespiti
* Deneyim şartı tespiti
* Eğitim şartı tespiti
* Başvuru tarihlerini çıkarma
* Kullanıcı profiline göre uygunluk değerlendirmesi

İlerleyen aşama AI özellikleri:

* CV-ilan eşleştirme
* Kişisel kariyer önerisi
* Eksik beceri analizi
* Eğitim önerisi
* Benzer ilan önerisi
* Kariyer koçu modülü

---

### 3.7 Bildirim Sistemi

Bildirim sistemi kullanıcının tercih ettiği şehir, meslek, kurum ve fırsat türlerine göre çalışacaktır.

İlk bildirim kanalları:

* E-posta
* Telegram

İlerleyen kanallar:

* Web push
* Mobil push
* WhatsApp Business API

Bildirim tetikleyicileri:

* Yeni ilan bulunduğunda
* Son başvuru tarihi yaklaştığında
* Favori kurumdan yeni duyuru geldiğinde
* Kullanıcı profiline yüksek uyumlu ilan bulunduğunda
* Yeni eğitim, yarışma veya burs fırsatı yayımlandığında

---

## 4. Önerilen Proje Yapısı

İlk profesyonel proje yapısı şu şekilde planlanmaktadır:

```text
kariyeratlas/
├── apps/
│   ├── web/
│   └── admin/
│
├── packages/
│   ├── ui/
│   ├── database/
│   ├── crawler/
│   ├── shared/
│   └── config/
│
├── docs/
│   ├── PRODUCT_BRIEF.md
│   ├── PRD.md
│   ├── ROADMAP.md
│   ├── ARCHITECTURE.md
│   └── BRAND.md
│
├── scripts/
│
├── .github/
│   └── workflows/
│
├── README.md
├── package.json
├── turbo.json
└── .gitignore
```

Bu yapı monorepo mantığıyla tasarlanmıştır. Böylece web uygulaması, admin paneli, ortak UI bileşenleri, veritabanı paketi ve crawler altyapısı aynı repository içinde yönetilebilir.

---

## 5. Veri Modeli Taslağı

İlk aşamada temel veri tabloları şunlar olacaktır:

### Users

Kullanıcı hesaplarını temsil eder.

Alanlar:

* id
* email
* name
* role
* created_at
* updated_at

### Profiles

Kullanıcı profil bilgilerini tutar.

Alanlar:

* id
* user_id
* profession_id
* city_id
* experience_level
* preferred_work_type
* notification_preferences

### Professions

Meslek gruplarını temsil eder.

Alanlar:

* id
* name
* slug
* category
* is_active

### Cities

Şehir bilgilerini tutar.

Alanlar:

* id
* name
* region
* country

### Organizations

Kurum, şirket, belediye, meslek odası veya kamu kurumlarını temsil eder.

Alanlar:

* id
* name
* type
* city_id
* website_url
* source_url

### Opportunities

İlan ve fırsatları temsil eder.

Alanlar:

* id
* title
* description
* organization_id
* city_id
* district
* opportunity_type
* work_type
* source_url
* application_url
* published_at
* deadline_at
* status
* raw_content
* ai_summary
* created_at
* updated_at

### OpportunityProfessions

İlanların hangi mesleklerle ilişkili olduğunu tutar.

Alanlar:

* opportunity_id
* profession_id
* relevance_score

### Sources

Takip edilen veri kaynaklarını temsil eder.

Alanlar:

* id
* name
* source_type
* url
* city_id
* organization_id
* crawl_frequency
* is_active
* last_checked_at

### CrawlLogs

Crawler çalışma kayıtlarını tutar.

Alanlar:

* id
* source_id
* status
* message
* checked_at
* new_items_count
* error_count

### Notifications

Kullanıcılara gönderilen bildirimleri tutar.

Alanlar:

* id
* user_id
* opportunity_id
* channel
* status
* sent_at

---

## 6. Kaynak Toplama Stratejisi

Kaynaklar kategori bazlı yönetilecektir.

Kaynak kategorileri:

* Kamu
* Belediye
* Belediye şirketi
* Bakanlık
* Üniversite
* Meslek odası
* Özel sektör
* Eğitim platformu
* Yarışma platformu
* Burs kaynağı
* İhale kaynağı

Her kaynak için şu bilgiler tutulacaktır:

* Kaynak adı
* Kaynak URL
* Kaynak türü
* Kontrol sıklığı
* Hedef anahtar kelimeler
* Dosya tarama gerekliliği
* Aktiflik durumu
* Son kontrol tarihi
* Hata durumu

---

## 7. Güvenlik Yaklaşımı

KariyerAtlas güvenlik açısından şu prensiplere göre geliştirilecektir:

* Ortam değişkenleri repository’ye yüklenmeyecektir.
* API anahtarları gizli tutulacaktır.
* Kullanıcı verileri minimum düzeyde saklanacaktır.
* Rol bazlı erişim kontrolü uygulanacaktır.
* Admin paneline yalnızca yetkili kullanıcılar erişebilecektir.
* Dosya yükleme süreçlerinde güvenlik kontrolleri yapılacaktır.
* Rate limit uygulanacaktır.
* Loglarda hassas veri tutulmayacaktır.
* GitHub ve Cloudflare hesaplarında iki faktörlü kimlik doğrulama kullanılacaktır.

---

## 8. Deploy ve Altyapı

İlk aşama deploy yapısı:

* Web uygulaması: Vercel
* Domain ve DNS: Cloudflare
* Veritabanı: Supabase PostgreSQL
* Dosya depolama: Supabase Storage
* Crawler zamanlama: GitHub Actions veya ayrı worker
* Log takibi: Vercel Logs, Supabase Logs

İlerleyen aşama altyapısı:

* Worker servisleri
* Redis queue
* Background jobs
* Dedicated crawler infrastructure
* Monitoring sistemi
* CDN optimizasyonu
* Mobil API katmanı

---

## 9. Ölçeklenebilirlik Stratejisi

İlk aşamada sistem hızlı geliştirme ve düşük maliyet hedefiyle kurulacaktır.

Kullanıcı ve veri hacmi arttıkça şu iyileştirmeler yapılacaktır:

* Crawler servislerinin ayrılması
* Kuyruk sistemi eklenmesi
* Redis kullanımı
* Background worker mimarisi
* Veritabanı indekslerinin optimize edilmesi
* AI analizlerinin asenkron çalışması
* Bildirim sisteminin ayrı servise taşınması
* API rate limit mekanizmaları
* Cache sistemi
* Arama motoru entegrasyonu

İlerleyen aşamalarda arama performansı için Meilisearch, Typesense veya Elasticsearch değerlendirilebilir.

---

## 10. MVP Teknik Kapsamı

İlk MVP için teknik kapsam:

* Next.js web uygulaması
* PostgreSQL veritabanı
* Prisma şeması
* Temel ilan listeleme
* İlan detay sayfası
* Manuel ilan ekleme
* Basit admin paneli
* Meslek ve şehir filtreleri
* Kaynak yönetimi
* İlk crawler prototipi
* PDF metin okuma prototipi
* E-posta veya Telegram bildirimi
* Vercel deploy
* kariyeratlas.com domain bağlantısı

---

## 11. Uzun Vadeli Teknik Hedef

KariyerAtlas’ın uzun vadeli teknik hedefi, yüz binlerce kullanıcıya hizmet verebilecek, binlerce kaynağı düzenli takip edebilecek, yapay zekâ destekli kişiselleştirme sunabilecek ve web ile mobil uygulamaları aynı veri altyapısı üzerinden besleyebilecek sürdürülebilir bir platform mimarisi oluşturmaktır.
