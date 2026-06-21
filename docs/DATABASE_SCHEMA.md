# KariyerAtlas Database Schema

## 1. Genel Yaklaşım

KariyerAtlas veritabanı; kullanıcılar, ilanlar, fırsatlar, kurumlar, kaynaklar, meslekler, şehirler, bildirimler, crawler kayıtları ve yapay zekâ analiz sonuçlarını yönetebilecek şekilde tasarlanacaktır.

İlk aşamada PostgreSQL kullanılacaktır. Veritabanı Supabase üzerinde çalışacak, uygulama tarafında Prisma ORM ile yönetilecektir.

Veri modeli şu prensiplere göre tasarlanacaktır:

* Ölçeklenebilirlik
* Temiz ilişki yapısı
* Kaynak takibi
* Yinelenen ilan kontrolü
* Meslek-fırsat eşleştirmesi
* Kullanıcı kişiselleştirmesi
* Admin yönetilebilirliği
* Yapay zekâ analizlerine uygun veri saklama
* İleride mobil uygulama ve işveren paneline genişleyebilme

---

## 2. Ana Veri Grupları

Veritabanı aşağıdaki ana veri gruplarından oluşacaktır:

* Kullanıcılar
* Kullanıcı profilleri
* Meslekler
* Şehirler ve ilçeler
* Kurumlar
* Kaynaklar
* İlanlar ve fırsatlar
* İlan-meslek eşleştirmeleri
* Etiketler
* Favoriler
* Bildirimler
* Crawler logları
* Yapay zekâ analizleri
* İşveren ve kurum hesapları
* Başvuru takip kayıtları

---

## 3. Users

Kullanıcı hesaplarını temsil eder.

| Alan       | Tip       | Açıklama                                         |
| ---------- | --------- | ------------------------------------------------ |
| id         | uuid      | Birincil anahtar                                 |
| email      | text      | Kullanıcı e-posta adresi                         |
| full_name  | text      | Kullanıcının adı soyadı                          |
| role       | enum      | user, premium_user, employer, admin, super_admin |
| avatar_url | text      | Profil fotoğrafı                                 |
| created_at | timestamp | Oluşturulma tarihi                               |
| updated_at | timestamp | Güncellenme tarihi                               |

Roller:

* user
* premium_user
* employer
* institution
* admin
* super_admin

---

## 4. Profiles

Kullanıcının mesleki tercihlerini ve profil bilgilerini tutar.

| Alan                        | Tip       | Açıklama                                   |
| --------------------------- | --------- | ------------------------------------------ |
| id                          | uuid      | Birincil anahtar                           |
| user_id                     | uuid      | Users tablosu ile ilişki                   |
| profession_id               | uuid      | Ana meslek                                 |
| city_id                     | uuid      | Yaşadığı veya tercih ettiği şehir          |
| experience_level            | enum      | student, new_graduate, junior, mid, senior |
| education_level             | enum      | associate, bachelor, master, phd           |
| preferred_work_type         | enum      | office, remote, hybrid, field              |
| preferred_opportunity_types | jsonb     | Tercih edilen fırsat türleri               |
| preferred_cities            | jsonb     | Tercih edilen şehirler                     |
| bio                         | text      | Kısa profil açıklaması                     |
| created_at                  | timestamp | Oluşturulma tarihi                         |
| updated_at                  | timestamp | Güncellenme tarihi                         |

---

## 5. Professions

Meslek gruplarını temsil eder.

| Alan        | Tip       | Açıklama                    |
| ----------- | --------- | --------------------------- |
| id          | uuid      | Birincil anahtar            |
| name        | text      | Meslek adı                  |
| slug        | text      | URL uyumlu meslek adı       |
| category    | text      | Meslek kategorisi           |
| parent_id   | uuid      | Üst meslek kategorisi       |
| is_priority | boolean   | İlk faz öncelikli meslek mi |
| is_active   | boolean   | Aktiflik durumu             |
| created_at  | timestamp | Oluşturulma tarihi          |
| updated_at  | timestamp | Güncellenme tarihi          |

İlk meslekler:

* Şehir ve Bölge Plancısı
* Peyzaj Mimarı
* Mimar
* CBS / GIS Uzmanı
* Harita Mühendisi
* İnşaat Mühendisi
* Çevre Mühendisi
* Jeoloji Mühendisi
* Jeofizik Mühendisi
* Ulaşım Plancısı
* Kentsel Tasarım Uzmanı

---

## 6. Cities

Şehirleri temsil eder.

| Alan       | Tip     | Açıklama             |
| ---------- | ------- | -------------------- |
| id         | uuid    | Birincil anahtar     |
| name       | text    | Şehir adı            |
| slug       | text    | URL uyumlu şehir adı |
| region     | text    | Bölge                |
| country    | text    | Ülke                 |
| plate_code | integer | Türkiye plaka kodu   |
| latitude   | decimal | Enlem                |
| longitude  | decimal | Boylam               |
| is_active  | boolean | Aktiflik durumu      |

---

## 7. Districts

İlçeleri temsil eder.

| Alan      | Tip     | Açıklama                  |
| --------- | ------- | ------------------------- |
| id        | uuid    | Birincil anahtar          |
| city_id   | uuid    | Cities tablosu ile ilişki |
| name      | text    | İlçe adı                  |
| slug      | text    | URL uyumlu ilçe adı       |
| latitude  | decimal | Enlem                     |
| longitude | decimal | Boylam                    |
| is_active | boolean | Aktiflik durumu           |

---

## 8. Organizations

Kurum, şirket, belediye, bakanlık, meslek odası veya üniversite gibi ilan/fırsat yayınlayan yapıları temsil eder.

| Alan              | Tip       | Açıklama             |
| ----------------- | --------- | -------------------- |
| id                | uuid      | Birincil anahtar     |
| name              | text      | Kurum adı            |
| slug              | text      | URL uyumlu kurum adı |
| organization_type | enum      | Kurum türü           |
| city_id           | uuid      | Şehir ilişkisi       |
| district_id       | uuid      | İlçe ilişkisi        |
| website_url       | text      | Resmi web sitesi     |
| logo_url          | text      | Logo                 |
| description       | text      | Kurum açıklaması     |
| is_verified       | boolean   | Doğrulanmış kurum mu |
| is_active         | boolean   | Aktiflik durumu      |
| created_at        | timestamp | Oluşturulma tarihi   |
| updated_at        | timestamp | Güncellenme tarihi   |

Kurum türleri:

* municipality
* metropolitan_municipality
* municipal_company
* ministry
* public_institution
* university
* professional_chamber
* private_company
* ngo
* education_provider
* competition_platform
* other

---

## 9. Sources

Crawler sisteminin takip edeceği kaynakları temsil eder.

| Alan            | Tip       | Açıklama                                |
| --------------- | --------- | --------------------------------------- |
| id              | uuid      | Birincil anahtar                        |
| organization_id | uuid      | Kurum ilişkisi                          |
| name            | text      | Kaynak adı                              |
| source_type     | enum      | Kaynak türü                             |
| url             | text      | Kaynak URL                              |
| crawl_frequency | enum      | hourly, daily, weekly, manual           |
| parser_type     | enum      | html, pdf, docx, xlsx, rss, api, manual |
| keywords        | jsonb     | Hedef anahtar kelimeler                 |
| city_id         | uuid      | Şehir ilişkisi                          |
| is_active       | boolean   | Aktif mi                                |
| last_checked_at | timestamp | Son kontrol tarihi                      |
| last_success_at | timestamp | Son başarılı kontrol                    |
| error_count     | integer   | Hata sayısı                             |
| created_at      | timestamp | Oluşturulma tarihi                      |
| updated_at      | timestamp | Güncellenme tarihi                      |

Kaynak türleri:

* public_recruitment
* municipality_announcement
* private_job_board
* company_career_page
* chamber_announcement
* education
* competition
* scholarship
* tender
* event
* other

---

## 10. Opportunities

İş ilanı, kamu alımı, eğitim, yarışma, burs, ihale, staj ve etkinlik gibi tüm fırsatları temsil eden ana tablodur.

| Alan               | Tip       | Açıklama                                              |
| ------------------ | --------- | ----------------------------------------------------- |
| id                 | uuid      | Birincil anahtar                                      |
| title              | text      | Fırsat başlığı                                        |
| slug               | text      | URL uyumlu başlık                                     |
| description        | text      | Temizlenmiş açıklama                                  |
| raw_content        | text      | Kaynaktan gelen ham içerik                            |
| opportunity_type   | enum      | Fırsat türü                                           |
| organization_id    | uuid      | Kurum ilişkisi                                        |
| source_id          | uuid      | Kaynak ilişkisi                                       |
| city_id            | uuid      | Şehir ilişkisi                                        |
| district_id        | uuid      | İlçe ilişkisi                                         |
| work_type          | enum      | office, remote, hybrid, field                         |
| employment_type    | enum      | full_time, part_time, contract, internship, freelance |
| experience_level   | enum      | student, new_graduate, junior, mid, senior            |
| education_level    | enum      | associate, bachelor, master, phd                      |
| kpss_required      | boolean   | KPSS şartı var mı                                     |
| kpss_score         | integer   | KPSS puan şartı                                       |
| salary_min         | integer   | Minimum maaş                                          |
| salary_max         | integer   | Maksimum maaş                                         |
| currency           | text      | Para birimi                                           |
| application_url    | text      | Başvuru bağlantısı                                    |
| source_url         | text      | Kaynak bağlantısı                                     |
| document_url       | text      | PDF/DOCX/XLSX bağlantısı                              |
| published_at       | timestamp | Yayın tarihi                                          |
| deadline_at        | timestamp | Son başvuru tarihi                                    |
| status             | enum      | active, expired, draft, archived                      |
| ai_summary         | text      | Yapay zekâ özeti                                      |
| ai_relevance_score | decimal   | Genel uygunluk puanı                                  |
| created_at         | timestamp | Oluşturulma tarihi                                    |
| updated_at         | timestamp | Güncellenme tarihi                                    |

Fırsat türleri:

* public_job
* private_job
* internship
* freelance
* education
* certificate
* competition
* scholarship
* tender
* event
* announcement
* academic
* other

---

## 11. OpportunityProfessions

Bir fırsatın birden fazla meslekle ilişkisini tutar.

| Alan            | Tip       | Açıklama               |
| --------------- | --------- | ---------------------- |
| id              | uuid      | Birincil anahtar       |
| opportunity_id  | uuid      | Opportunities ilişkisi |
| profession_id   | uuid      | Professions ilişkisi   |
| relevance_score | decimal   | Meslekle ilişki puanı  |
| is_primary      | boolean   | Ana meslek mi          |
| created_at      | timestamp | Oluşturulma tarihi     |

Örnek:

Bir ilan hem şehir plancısı hem peyzaj mimarı hem CBS uzmanı için uygun olabilir. Bu tablo çoklu eşleştirmeyi sağlar.

---

## 12. Tags

Etiketleri temsil eder.

| Alan       | Tip       | Açıklama           |
| ---------- | --------- | ------------------ |
| id         | uuid      | Birincil anahtar   |
| name       | text      | Etiket adı         |
| slug       | text      | URL uyumlu etiket  |
| category   | text      | Etiket kategorisi  |
| created_at | timestamp | Oluşturulma tarihi |

Örnek etiketler:

* KPSS
* Uzaktan
* Belediye
* Sözleşmeli Personel
* Kadrolu
* Yeni Mezun
* Staj
* CBS
* Netcad
* ArcGIS
* AutoCAD
* İhale
* Yarışma

---

## 13. OpportunityTags

Fırsat ve etiket ilişkisini tutar.

| Alan           | Tip  | Açıklama               |
| -------------- | ---- | ---------------------- |
| opportunity_id | uuid | Opportunities ilişkisi |
| tag_id         | uuid | Tags ilişkisi          |

---

## 14. Favorites

Kullanıcıların favoriye aldığı ilanları/fırsatları tutar.

| Alan           | Tip       | Açıklama                |
| -------------- | --------- | ----------------------- |
| id             | uuid      | Birincil anahtar        |
| user_id        | uuid      | Users ilişkisi          |
| opportunity_id | uuid      | Opportunities ilişkisi  |
| created_at     | timestamp | Favoriye eklenme tarihi |

---

## 15. Applications

Kullanıcının başvuru takibini tutar.

| Alan           | Tip       | Açıklama                                               |
| -------------- | --------- | ------------------------------------------------------ |
| id             | uuid      | Birincil anahtar                                       |
| user_id        | uuid      | Users ilişkisi                                         |
| opportunity_id | uuid      | Opportunities ilişkisi                                 |
| status         | enum      | saved, planned, applied, interview, rejected, accepted |
| applied_at     | timestamp | Başvuru tarihi                                         |
| notes          | text      | Kullanıcı notu                                         |
| created_at     | timestamp | Oluşturulma tarihi                                     |
| updated_at     | timestamp | Güncellenme tarihi                                     |

---

## 16. Notifications

Gönderilen bildirimleri tutar.

| Alan           | Tip       | Açıklama                                         |
| -------------- | --------- | ------------------------------------------------ |
| id             | uuid      | Birincil anahtar                                 |
| user_id        | uuid      | Users ilişkisi                                   |
| opportunity_id | uuid      | Opportunities ilişkisi                           |
| channel        | enum      | email, telegram, web_push, mobile_push, whatsapp |
| title          | text      | Bildirim başlığı                                 |
| message        | text      | Bildirim metni                                   |
| status         | enum      | pending, sent, failed, read                      |
| sent_at        | timestamp | Gönderim tarihi                                  |
| read_at        | timestamp | Okunma tarihi                                    |
| created_at     | timestamp | Oluşturulma tarihi                               |

---

## 17. NotificationPreferences

Kullanıcı bildirim tercihlerini tutar.

| Alan              | Tip       | Açıklama                               |
| ----------------- | --------- | -------------------------------------- |
| id                | uuid      | Birincil anahtar                       |
| user_id           | uuid      | Users ilişkisi                         |
| channel           | enum      | email, telegram, web_push, mobile_push |
| opportunity_types | jsonb     | Fırsat türü tercihleri                 |
| profession_ids    | jsonb     | Meslek tercihleri                      |
| city_ids          | jsonb     | Şehir tercihleri                       |
| organization_ids  | jsonb     | Kurum tercihleri                       |
| frequency         | enum      | instant, daily, weekly                 |
| is_active         | boolean   | Aktif mi                               |
| created_at        | timestamp | Oluşturulma tarihi                     |
| updated_at        | timestamp | Güncellenme tarihi                     |

---

## 18. CrawlLogs

Crawler çalışma kayıtlarını tutar.

| Alan                | Tip       | Açıklama                             |
| ------------------- | --------- | ------------------------------------ |
| id                  | uuid      | Birincil anahtar                     |
| source_id           | uuid      | Sources ilişkisi                     |
| status              | enum      | success, partial_success, failed     |
| message             | text      | Log mesajı                           |
| checked_at          | timestamp | Kontrol zamanı                       |
| duration_ms         | integer   | Çalışma süresi                       |
| found_items_count   | integer   | Bulunan kayıt sayısı                 |
| new_items_count     | integer   | Yeni kayıt sayısı                    |
| updated_items_count | integer   | Güncellenen kayıt sayısı             |
| error_count         | integer   | Hata sayısı                          |
| raw_response_hash   | text      | Kaynak değişiklik kontrolü için hash |

---

## 19. Documents

PDF, DOCX, XLSX gibi dosyaları temsil eder.

| Alan           | Tip       | Açıklama                      |
| -------------- | --------- | ----------------------------- |
| id             | uuid      | Birincil anahtar              |
| opportunity_id | uuid      | Fırsat ilişkisi               |
| source_id      | uuid      | Kaynak ilişkisi               |
| file_url       | text      | Dosya bağlantısı              |
| file_type      | enum      | pdf, docx, xlsx, image, other |
| extracted_text | text      | Çıkarılmış metin              |
| ocr_used       | boolean   | OCR kullanıldı mı             |
| processed_at   | timestamp | İşlenme tarihi                |
| created_at     | timestamp | Oluşturulma tarihi            |

---

## 20. AIAnalyses

Yapay zekâ analiz sonuçlarını tutar.

| Alan                  | Tip       | Açıklama                        |
| --------------------- | --------- | ------------------------------- |
| id                    | uuid      | Birincil anahtar                |
| opportunity_id        | uuid      | Opportunities ilişkisi          |
| summary               | text      | İlan özeti                      |
| detected_professions  | jsonb     | Tespit edilen meslekler         |
| detected_skills       | jsonb     | Tespit edilen beceriler         |
| detected_requirements | jsonb     | Tespit edilen şartlar           |
| kpss_detected         | boolean   | KPSS tespit edildi mi           |
| deadline_detected     | timestamp | AI tarafından bulunan son tarih |
| confidence_score      | decimal   | Güven puanı                     |
| model_name            | text      | Kullanılan model                |
| created_at            | timestamp | Oluşturulma tarihi              |

---

## 21. Skills

Beceri ve yetkinlikleri temsil eder.

| Alan       | Tip       | Açıklama           |
| ---------- | --------- | ------------------ |
| id         | uuid      | Birincil anahtar   |
| name       | text      | Beceri adı         |
| slug       | text      | URL uyumlu beceri  |
| category   | text      | Beceri kategorisi  |
| created_at | timestamp | Oluşturulma tarihi |

Örnek beceriler:

* ArcGIS
* QGIS
* Netcad
* AutoCAD
* Photoshop
* Illustrator
* Lumion
* SketchUp
* MS Office
* Python
* SQL
* Proje Yönetimi
* Raporlama

---

## 22. OpportunitySkills

İlan ve beceri ilişkisini tutar.

| Alan             | Tip     | Açıklama               |
| ---------------- | ------- | ---------------------- |
| opportunity_id   | uuid    | Opportunities ilişkisi |
| skill_id         | uuid    | Skills ilişkisi        |
| importance_score | decimal | Beceri önem puanı      |

---

## 23. EmployerProfiles

İşveren hesaplarını temsil eder.

| Alan            | Tip       | Açıklama               |
| --------------- | --------- | ---------------------- |
| id              | uuid      | Birincil anahtar       |
| user_id         | uuid      | Users ilişkisi         |
| organization_id | uuid      | Organizations ilişkisi |
| position        | text      | Kurumdaki pozisyon     |
| is_verified     | boolean   | Doğrulanmış işveren mi |
| created_at      | timestamp | Oluşturulma tarihi     |

---

## 24. SubscriptionPlans

Premium üyelik ve işveren paketlerini temsil eder.

| Alan           | Tip     | Açıklama                            |
| -------------- | ------- | ----------------------------------- |
| id             | uuid    | Birincil anahtar                    |
| name           | text    | Plan adı                            |
| plan_type      | enum    | user_premium, employer, institution |
| price          | integer | Fiyat                               |
| currency       | text    | Para birimi                         |
| billing_period | enum    | monthly, yearly                     |
| features       | jsonb   | Plan özellikleri                    |
| is_active      | boolean | Aktiflik durumu                     |

---

## 25. UserSubscriptions

Kullanıcı aboneliklerini tutar.

| Alan       | Tip       | Açıklama                         |
| ---------- | --------- | -------------------------------- |
| id         | uuid      | Birincil anahtar                 |
| user_id    | uuid      | Users ilişkisi                   |
| plan_id    | uuid      | SubscriptionPlans ilişkisi       |
| status     | enum      | active, canceled, expired, trial |
| started_at | timestamp | Başlangıç tarihi                 |
| expires_at | timestamp | Bitiş tarihi                     |
| created_at | timestamp | Oluşturulma tarihi               |

---

## 26. Temel İlişkiler

Ana ilişkiler:

* Bir kullanıcı bir profile sahiptir.
* Bir kullanıcı birçok favori oluşturabilir.
* Bir kullanıcı birçok başvuru kaydı oluşturabilir.
* Bir kurum birçok fırsat yayımlayabilir.
* Bir kaynak birçok fırsat üretebilir.
* Bir fırsat birçok meslekle ilişkili olabilir.
* Bir fırsat birçok etikete sahip olabilir.
* Bir fırsat birçok beceriyle ilişkili olabilir.
* Bir fırsat bir veya daha fazla dokümana sahip olabilir.
* Bir kaynak birçok crawler loguna sahip olabilir.
* Bir fırsat bir yapay zekâ analizine sahip olabilir.

---

## 27. MVP İçin Minimum Tablolar

İlk MVP’de mutlaka olması gereken tablolar:

* users
* profiles
* professions
* cities
* districts
* organizations
* sources
* opportunities
* opportunity_professions
* tags
* opportunity_tags
* favorites
* crawl_logs
* documents
* ai_analyses

İşveren paneli, abonelik ve gelişmiş başvuru takip sistemi daha sonraki fazlara bırakılabilir.

---

## 28. İndeksleme Stratejisi

Performans için indekslenecek alanlar:

* opportunities.title
* opportunities.city_id
* opportunities.organization_id
* opportunities.opportunity_type
* opportunities.status
* opportunities.deadline_at
* opportunities.published_at
* sources.url
* sources.is_active
* organizations.slug
* professions.slug
* cities.slug

Arama performansı arttığında Meilisearch, Typesense veya Elasticsearch entegrasyonu değerlendirilebilir.

---

## 29. Veri Kalitesi Kuralları

Veri kalitesini korumak için şu kurallar uygulanacaktır:

* Aynı kaynak URL’ye sahip ilan tekrar eklenmeyecektir.
* Aynı başlık + kurum + son başvuru tarihi kombinasyonu duplicate olarak kontrol edilecektir.
* Son başvuru tarihi geçmiş ilanlar otomatik olarak expired yapılacaktır.
* Kaynak URL’si zorunlu olacaktır.
* Kurum adı standartlaştırılacaktır.
* Meslek eşleştirmeleri manuel veya AI destekli doğrulanabilir olacaktır.
* Hatalı crawler sonuçları admin onayına gönderilecektir.

---

## 30. Uzun Vadeli Veritabanı Hedefi

KariyerAtlas veritabanı uzun vadede yalnızca ilanları değil; kullanıcı davranışlarını, kariyer tercihlerini, beceri eşleştirmelerini, işveren verilerini, başvuru süreçlerini ve yapay zekâ destekli kariyer önerilerini destekleyecek kapsamlı bir kariyer veri altyapısına dönüşecektir.
