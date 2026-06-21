export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white lg:px-8">
      <article className="mx-auto max-w-4xl">
        <a href="/" className="text-sm text-blue-300 hover:text-blue-200">
          ← Ana sayfaya dön
        </a>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          Kullanım Koşulları
        </h1>

        <p className="mt-4 text-sm text-slate-400">
          Son güncelleme: 21 Haziran 2026
        </p>

        <div className="mt-10 space-y-8 leading-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white">
              1. Platformun Amacı
            </h2>
            <p className="mt-3">
              KariyerAtlas; iş ilanları, kamu personel alımları, özel sektör
              fırsatları, eğitimler, yarışmalar, burslar, stajlar ve mesleki
              gelişim kaynaklarını tek platformda toplamayı hedefleyen bir
              kariyer ve fırsat platformudur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              2. Kullanım Kapsamı
            </h2>
            <p className="mt-3">
              Kullanıcılar KariyerAtlas’ı kariyer fırsatlarını incelemek, erken
              erişim listesine kaydolmak ve ilerleyen aşamalarda kendilerine
              uygun iş ve fırsat duyurularını takip etmek amacıyla kullanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              3. Erken Erişim Kaydı
            </h2>
            <p className="mt-3">
              Erken erişim formuna bilgi bırakan kullanıcılar, KariyerAtlas’ın
              geliştirme süreci ve yayına alınması hakkında bilgilendirilebilir.
              Kullanıcı, form üzerinden paylaştığı bilgilerin doğru ve kendisine
              ait olduğunu kabul eder.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              4. İçerik ve Fırsat Bilgileri
            </h2>
            <p className="mt-3">
              KariyerAtlas üzerinde ilerleyen aşamalarda yayımlanacak ilan,
              duyuru ve fırsat bilgileri farklı kamu, özel sektör ve kurumsal
              kaynaklardan derlenebilir. Kullanıcılar başvuru yapmadan önce
              ilgili ilanın orijinal kaynağını ve resmî başvuru şartlarını
              ayrıca kontrol etmelidir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              5. Sorumluluk Sınırı
            </h2>
            <p className="mt-3">
              KariyerAtlas, fırsatları daha erişilebilir ve düzenli hale
              getirmeyi amaçlar. Ancak ilanların güncelliği, başvuru şartları,
              son başvuru tarihleri ve kurum kararları ilgili kurum veya
              şirketlerin sorumluluğundadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              6. Platformun Geliştirme Aşaması
            </h2>
            <p className="mt-3">
              KariyerAtlas şu anda geliştirme aşamasındadır. Bu nedenle bazı
              özellikler test, erken erişim veya kademeli yayın sürecinde
              olabilir. Platformun kapsamı, tasarımı ve özellikleri zaman içinde
              güncellenebilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              7. Değişiklikler
            </h2>
            <p className="mt-3">
              KariyerAtlas, kullanım koşullarını gerektiğinde güncelleyebilir.
              Güncel koşullar bu sayfa üzerinden yayımlanır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white">
              8. İletişim
            </h2>
            <p className="mt-3">
              Kullanım koşullarıyla ilgili sorular için aşağıdaki iletişim
              adresi kullanılabilir:
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