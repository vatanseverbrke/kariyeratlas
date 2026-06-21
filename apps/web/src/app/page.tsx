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

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 font-bold">
              KA
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">
                KariyerAtlas
              </p>
              <p className="text-xs text-slate-400">kariyeratlas.com</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#firsatlar" className="hover:text-white">
              Fırsatlar
            </a>
            <a href="#meslekler" className="hover:text-white">
              Meslekler
            </a>
            <a href="#vizyon" className="hover:text-white">
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
                href="#firsatlar"
                className="rounded-full bg-blue-600 px-7 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Platformu keşfet
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
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
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
          id="vizyon"
          className="border-t border-white/10 py-12 text-slate-300"
        >
          <h2 className="text-3xl font-semibold text-white">
            Dağınık kariyer kaynaklarını tek merkezde topluyoruz.
          </h2>
          <p className="mt-4 max-w-4xl leading-8">
            KariyerAtlas, teknik mesleklerden başlayarak tüm meslek gruplarına
            genişleyebilecek şekilde tasarlanıyor. Hedefimiz; kullanıcıların
            belediyeler, bakanlıklar, meslek odaları, özel sektör firmaları,
            üniversiteler ve eğitim kaynakları arasında kaybolmadan kendilerine
            uygun fırsatları zamanında keşfetmesini sağlamak.
          </p>
        </section>
      </section>
    </main>
  );
}