import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  opportunity_type: string;
  profession_area: string | null;
  city: string | null;
  description: string | null;
  source_url: string;
  deadline: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
};

type OpportunitiesPageProps = {
  searchParams?: Promise<{
    type?: string;
    profession?: string;
    city?: string;
    q?: string;
  }>;
};

const opportunityTypes = [
  "Kamu alımı",
  "Belediye ilanı",
  "Özel sektör",
  "Staj",
  "Eğitim",
  "Yarışma",
  "Burs",
  "Meslek odası",
];

const professionAreas = [
  "Şehir ve Bölge Planlama",
  "Peyzaj Mimarlığı",
  "Mimarlık",
  "CBS / GIS",
  "Harita Mühendisliği",
  "İnşaat Mühendisliği",
  "Çevre Mühendisliği",
  "İç Mimarlık",
  "Endüstri Ürünleri Tasarımı",
  "Coğrafya",
  "Kamu Yönetimi",
  "Sosyoloji",
  "Ekonomi",
  "İstatistik",
  "Veri Analizi",
  "Yazılım / Bilişim",
  "Diğer",
];

const cities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Kırklareli",
  "Edirne",
  "Tekirdağ",
  "Kocaeli",
  "Bursa",
  "Antalya",
  "Uzaktan",
  "Diğer",
];

function formatDate(value: string | null) {
  if (!value) return "Belirtilmedi";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getTodayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function isDeadlineVisible(deadline: string | null, today: string) {
  if (!deadline) return true;
  return deadline >= today;
}

function getDaysLeft(deadline: string | null) {
  if (!deadline) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = new Date(`${deadline}T00:00:00`);
  const diff = deadlineDate.getTime() - today.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function matchesSearch(opportunity: Opportunity, query: string) {
  if (!query) return true;

  const haystack = [
    opportunity.title,
    opportunity.organization,
    opportunity.opportunity_type,
    opportunity.profession_area,
    opportunity.city,
    opportunity.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return haystack.includes(query.toLocaleLowerCase("tr-TR"));
}

export default async function OpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  const params = await searchParams;

  const selectedType = params?.type || "";
  const selectedProfession = params?.profession || "";
  const selectedCity = params?.city || "";
  const searchQuery = (params?.q || "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let opportunities: Opportunity[] = [];
  let errorMessage: string | null = null;

  if (!supabaseUrl || !serviceRoleKey) {
    errorMessage = "Supabase bağlantı ayarları eksik.";
  } else {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    let query = supabase
      .from("opportunities")
      .select(
        "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline,status,is_featured,created_at"
      )
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (selectedType) {
      query = query.eq("opportunity_type", selectedType);
    }

    if (selectedProfession) {
      query = query.eq("profession_area", selectedProfession);
    }

    if (selectedCity) {
      query = query.eq("city", selectedCity);
    }

    const { data, error } = await query;

    if (error) {
      errorMessage = error.message;
    } else {
      const today = getTodayDateOnly();

      opportunities = ((data || []) as Opportunity[])
        .filter((opportunity) =>
          isDeadlineVisible(opportunity.deadline, today)
        )
        .filter((opportunity) => matchesSearch(opportunity, searchQuery));
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <nav className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="text-sm text-blue-300 hover:text-blue-200">
              ← Ana sayfaya dön
            </a>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              KariyerAtlas Fırsatları
            </h1>

            <p className="mt-4 max-w-3xl leading-8 text-slate-300">
              Kamu alımları, belediye ilanları, özel sektör fırsatları,
              stajlar, eğitimler, yarışmalar ve mesleki gelişim duyurularını
              tek merkezden takip et.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
            <p className="text-sm text-slate-400">Aktif fırsat</p>
            <p className="mt-1 text-3xl font-semibold">
              {opportunities.length}
            </p>
          </div>
        </nav>

        <form
          action="/firsatlar"
          method="get"
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Arama
              </label>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="CBS, belediye, staj..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Fırsat türü
              </label>
              <select
                name="type"
                defaultValue={selectedType}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Tümü</option>
                {opportunityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Meslek / Alan
              </label>
              <select
                name="profession"
                defaultValue={selectedProfession}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Tümü</option>
                {professionAreas.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Şehir
              </label>
              <select
                name="city"
                defaultValue={selectedCity}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Tümü</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Filtrele
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/firsatlar"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Filtreleri temizle
            </a>

            <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-xs text-emerald-300">
              Süresi geçen fırsatlar otomatik gizlenir
            </span>
          </div>
        </form>

        {errorMessage ? (
          <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
            <p className="font-semibold">Fırsatlar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{errorMessage}</p>
          </div>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => {
              const daysLeft = getDaysLeft(opportunity.deadline);

              return (
                <article
                  key={opportunity.id}
                  className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                      {opportunity.opportunity_type}
                    </span>

                    {opportunity.is_featured ? (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                        Öne çıkan
                      </span>
                    ) : null}

                    {opportunity.city ? (
                      <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-slate-300">
                        {opportunity.city}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-white">
                    {opportunity.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {opportunity.organization}
                  </p>

                  {opportunity.profession_area ? (
                    <p className="mt-4 text-sm text-slate-300">
                      {opportunity.profession_area}
                    </p>
                  ) : null}

                  {opportunity.description ? (
                    <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-400">
                      {opportunity.description}
                    </p>
                  ) : null}

                  <div className="mt-auto pt-6">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                      <p className="text-xs text-slate-500">Son başvuru</p>
                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {formatDate(opportunity.deadline)}
                      </p>

                      {daysLeft !== null ? (
                        <p className="mt-1 text-xs text-slate-400">
                          {daysLeft === 0
                            ? "Bugün son gün"
                            : `${daysLeft} gün kaldı`}
                        </p>
                      ) : null}
                    </div>

                    <a
                      href={opportunity.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    >
                      Fırsatı incele
                    </a>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400 md:col-span-2 xl:col-span-3">
              Seçili filtrelere uygun aktif fırsat bulunamadı.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
