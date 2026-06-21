export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white lg:px-8">
      <article className="mx-auto max-w-4xl">
        <a href="/" className="text-sm text-blue-300 hover:text-blue-200">
          ← Ana sayfaya dön
        </a>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          Gizlilik Politikası
        </h1>

        <p className="mt-4 text-sm text-slate-400">
          Son güncelleme: 21 Haziran 2026
        </p>

        <div className="mt-10 space-y-8 leading-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">
              1. Genel Bilgilendirme
            </h2>
            <p className="mt-3">
              KariyerAtlas; iş ilanları, kamu alımları, belediye duyuruları,
              özel sektör fırsatları, eğitimler, yarışmalar, burslar ve mesleki
              gelişim kaynaklarını tek platformda toplamayı amaçlayan bir
              kariyer ve fırsat platformudur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              2. Toplanan Veriler
            </h2>
            <p className="mt-3">
              Erken erişim formu aracılığıyla e-posta adresi, meslek veya alan
              bilgisi, şehir bilgisi ve form gönderim tarihi toplanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              3. Verilerin Kullanım Amacı
            </h2>
            <p className="mt-3">
              Toplanan bilgiler; erken erişim listesini oluşturmak, kullanıcıları
              KariyerAtlas’ın yayına alınması hakkında bilgilendirmek, ürün
              geliştirme sürecini iyileştirmek ve meslek/şehir bazlı ihtiyaçları
              analiz etmek amacıyla kullanılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              4. Verilerin Saklanması
            </h2>
            <p className="mt-3">
              Erken erişim formu üzerinden toplanan bilgiler güvenli veritabanı
              altyapısında saklanır. Bu bilgiler yalnızca KariyerAtlas erken
              erişim, bilgilendirme ve ürün geliştirme süreçleri için kullanılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              5. Üçüncü Kişilerle Paylaşım
            </h2>
            <p className="mt-3">
              KariyerAtlas, kullanıcıların kişisel verilerini satmaz. Veriler,
              yalnızca teknik altyapının çalışması için gerekli olan hizmet
              sağlayıcılarla sınırlı şekilde işlenebilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              6. Kullanıcı Hakları
            </h2>
            <p className="mt-3">
              Kullanıcılar, kişisel verilerinin işlenip işlenmediğini öğrenme,
              işlenen veriler hakkında bilgi talep etme, verilerin düzeltilmesini
              veya silinmesini isteme haklarına sahiptir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              7. İletişim
            </h2>
            <p className="mt-3">
              Gizlilik ve kişisel veri talepleri için aşağıdaki iletişim adresi
              kullanılabilir:
            </p>
            <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-blue-200">
              info@kariyeratlas.com
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Not: Bu e-posta adresi ilerleyen aşamada aktif edilecektir.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}