const stats = [
  { label: "Fırsat türü", value: "12+" },
  { label: "Öncelikli meslek", value: "7" },
  { label: "İlk kaynak hedefi", value: "25+" },
];

const opportunityTypes = [
  "Kamu alımları",
  "Belediye ilanları",
  "Özel sektör",
  "Stajlar",
  "Eğitimler",
  "Yarışmalar",
  "Burslar",
  "Meslek odaları",
];

const professions = [
  "Şehir ve Bölge Planlama",
  "Peyzaj Mimarlığı",
  "Mimarlık",
  "CBS / GIS",
  "Harita Mühendisliği",
  "İnşaat Mühendisliği",
  "Çevre Mühendisliği",
];

const focusAreas = [
  "Belediyeler",
  "Bakanlıklar",
  "Meslek odaları",
  "Üniversiteler",
  "Özel sektör firmaları",
  "Eğitim ve yarışma kaynakları",
];

const earlyAccessBenefits = [
  "İlk kullanıcılar arasında yer al",
  "Kamu, belediye ve özel sektör fırsatlarından erken haberdar ol",
  "Planlama, peyzaj, mimarlık ve CBS alanlarına özel takip al",
];

type HomeProps = {
  searchParams?: Promise<{
    early_access?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const earlyAccessStatus = params?.early_access;

  const feedback =
    earlyAccessStatus === "success"
      ? {
          title: "Kaydın alındı.",
          text: "KariyerAtlas yayına hazırlandığında seni bilgilendireceğiz.",
          className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
        }
      : earlyAccessStatus === "invalid_email"
        ? {
            title: "E-posta adresini kontrol et.",
            text: "Geçerli bir e-posta adresi girerek tekrar deneyebilirsin.",
            className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
          }
        : earlyAccessStatus === "error" || earlyAccessStatus === "config_error"
          ? {
              title: "Kayıt alınamadı.",
              text: "Kısa bir süre sonra tekrar deneyebilirsin.",
              className: "border-red-400/30 bg-red-400/10 text-red-200",
            }
          : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10">
              <span className="text-sm font-bold text-white">KA</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
              <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-emerald-500" />
              <span className="absolute h-8 w-8 rounded-full border border-cyan-400/40" />
            </div>

            <div>
              <p className="text-lg font-semibold tracking-tight">
                KariyerAtlas
              </p>
              <p className="text-xs text-slate-400">kariyeratlas.com</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#firsatlar" className="transition hover:text-white">
              Fırsatlar
            </a>
            <a href="#meslekler" className="transition hover:text-white">
              Meslekler
            </a>
            <a href="#erken-erisim" className="transition hover:text-white">
              Erken Erişim
            </a>
            <a href="#vizyon" className="transition hover:text-white">
              Vizyon
            </a>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
              Kamu, özel sektör ve mesleki fırsatlar tek platformda
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Kariyerini keşfet, fırsatları yakala.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              KariyerAtlas; iş ilanları, kamu alımları, belediye duyuruları,
              özel sektör fırsatları, eğitimler, yarışmalar ve mesleki gelişim
              kaynaklarını tek merkezde toplayan akıllı kariyer platformudur.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="#erken-erisim"
                className="rounded-full bg-blue-600 px-7 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Erken erişim talep et
              </a>
              <a
                href="#vizyon"
                className="rounded-full border border-white/15 px-7 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Vizyonu incele
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="text-3xl font-semibold">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-blue-950/40">
            <div className="rounded-[1.5rem] bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Akıllı fırsat akışı</p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Öncelikli takip alanları
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                  MVP
                </span>
              </div>

              <div className="space-y-3" id="firsatlar">
                {opportunityTypes.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-slate-200">{item}</span>
                    <span className="text-xs text-slate-500">
                      Takip edilecek
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section
          id="meslekler"
          className="grid gap-5 border-t border-white/10 py-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {professions.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-blue-400/40 hover:bg-white/[0.06]"
            >
              <p className="text-lg font-semibold">{item}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                İlk fazda ilan, eğitim, yarışma, staj ve kamu alımı takibi
                yapılacak öncelikli meslek grubu.
              </p>
            </div>
          ))}
        </section>

        <section
          id="erken-erisim"
          className="grid gap-10 border-t border-white/10 py-16 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <p className="text-sm font-medium text-blue-200">
              Yakında yayında
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              İlk kullanıcılar arasında yerini al.
            </h2>
            <p className="mt-4 max-w-2xl leading-8 text-slate-300">
              KariyerAtlas şu anda geliştirme aşamasında. Platform yayına
              hazırlandığında şehir planlama, peyzaj mimarlığı, mimarlık,
              CBS/GIS ve diğer teknik meslek fırsatlarından erken haberdar
              olmak için e-posta adresini bırakabilirsin.
            </p>

            <div className="mt-8 space-y-3">
              {earlyAccessBenefits.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs text-emerald-300">
                    ✓
                  </span>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-blue-400/20 bg-blue-400/[0.06] p-6 shadow-2xl shadow-blue-950/40">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6">
              <p className="text-sm font-medium text-slate-400">
                Erken erişim listesi
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                KariyerAtlas yayına hazırlandığında haberdar ol.
              </h3>

              {feedback ? (
                <div
                  className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${feedback.className}`}
                >
                  <p className="font-semibold">{feedback.title}</p>
                  <p className="mt-1 opacity-90">{feedback.text}</p>
                </div>
              ) : null}

              <form
                action="/api/early-access"
                method="post"
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    E-posta adresin
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="ornek@mail.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="profession"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Meslek / alan
                    </label>
                    <select
                      id="profession"
                      name="profession"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      defaultValue=""
                    >
                      <option value="" className="bg-slate-950">
                        Seçiniz
                      </option>
                      {professions.map((profession) => (
                        <option
                          key={profession}
                          value={profession}
                          className="bg-slate-950"
                        >
                          {profession}
                        </option>
                      ))}
                      <option value="Diğer" className="bg-slate-950">
                        Diğer
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Şehir
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Örn. İstanbul"
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Erken erişim talep et
                </button>

                <p className="text-xs leading-5 text-slate-500">
                  E-posta adresin yalnızca KariyerAtlas erken erişim ve ürün
                  bilgilendirmeleri için kullanılacaktır. Detaylar için{" "}
                  <a
                    href="/gizlilik-politikasi"
                    className="text-blue-300 hover:text-blue-200"
                  >
                    Gizlilik Politikası
                  </a>{" "}
                  sayfasını inceleyebilirsin.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section
          id="vizyon"
          className="grid gap-10 border-t border-white/10 py-12 lg:grid-cols-[1fr_0.85fr]"
        >
          <div>
            <h2 className="text-3xl font-semibold text-white">
              Dağınık kariyer kaynaklarını tek merkezde topluyoruz.
            </h2>
            <p className="mt-4 max-w-4xl leading-8 text-slate-300">
              KariyerAtlas, teknik mesleklerden başlayarak tüm meslek gruplarına
              genişleyebilecek şekilde tasarlanıyor. Hedefimiz; kullanıcıların
              belediyeler, bakanlıklar, meslek odaları, özel sektör firmaları,
              üniversiteler ve eğitim kaynakları arasında kaybolmadan
              kendilerine uygun fırsatları zamanında keşfetmesini sağlamak.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-medium text-blue-200">
              İlk kaynak kapsamı
            </p>

            <div className="mt-5 grid gap-3">
              {focusAreas.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-slate-900/70 px-4 py-3"
                >
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8">
          <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 KariyerAtlas. Tüm hakları saklıdır.</p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/gizlilik-politikasi"
                className="transition hover:text-white"
              >
                Gizlilik Politikası
              </a>
              <a
                href="/kullanim-kosullari"
                className="transition hover:text-white"
              >
                Kullanım Koşulları
              </a>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}