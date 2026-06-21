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
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "Belirtilmemiş";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getDeadlineClass(deadline: string | null) {
  if (!deadline) {
    return "bg-slate-500/15 text-slate-300";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const differenceInDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (differenceInDays < 0) {
    return "bg-red-500/15 text-red-300";
  }

  if (differenceInDays <= 7) {
    return "bg-amber-500/15 text-amber-300";
  }

  return "bg-emerald-500/15 text-emerald-300";
}

function getDeadlineLabel(deadline: string | null) {
  if (!deadline) return "Son başvuru belirtilmemiş";

  const today = new Date();
  const deadlineDate = new Date(deadline);
  const differenceInDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (differenceInDays < 0) return "Süresi doldu";
  if (differenceInDays === 0) return "Bugün son gün";
  if (differenceInDays <= 7) return `${differenceInDays} gün kaldı`;

  return formatDate(deadline);
}

function uniqueValues(
  opportunities: Opportunity[],
  key: "opportunity_type" | "profession_area" | "city"
) {
  return Array.from(
    new Set(
      opportunities
        .map((item) => item[key])
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b, "tr"));
}

export default async function OpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  const params = await searchParams;

  const selectedType = params?.type || "";
  const selectedProfession = params?.profession || "";
  const selectedCity = params?.city || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
          Supabase bağlantı ayarları eksik.
        </div>
      </main>
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: allData } = await supabase
    .from("opportunities")
    .select(
      "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline,status,is_featured,created_at"
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("deadline", { ascending: true });

  const allOpportunities = (allData || []) as Opportunity[];

  let query = supabase
    .from("opportunities")
    .select(
      "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline,status,is_featured,created_at"
    )
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .order("deadline", { ascending: true });

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

  const opportunities = (data || []) as Opportunity[];

  const types = uniqueValues(allOpportunities, "opportunity_type");
  const professions = uniqueValues(allOpportunities, "profession_area");
  const cities = uniqueValues(allOpportunities, "city");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-40 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/70 px-5 py-3 backdrop-blur-xl">
          <a href="/" className="flex items-center gap-3">
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
          </a>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="/" className="transition hover:text-white">
              Ana sayfa
            </a>
            <a href="/#erken-erisim" className="transition hover:text-white">
              Erken Erişim
            </a>
            <a
              href="mailto:info@kariyeratlas.com"
              className="transition hover:text-white"
            >
              İletişim
            </a>
          </div>
        </nav>

        <header className="border-b border-white/10 py-16">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
              KariyerAtlas fırsat akışı
            </div>

            <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
              Fırsatlar
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Kamu alımları, belediye duyuruları, özel sektör ilanları, stajlar,
              eğitimler, yarışmalar ve mesleki gelişim fırsatlarını tek
              merkezde takip et.
            </p>
          </div>
        </header>

        <section className="border-b border-white/10 py-8">
          <form className="grid gap-4 md:grid-cols-4">
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
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Meslek / alan
              </label>
              <select
                name="profession"
                defaultValue={selectedProfession}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Tümü</option>
                {professions.map((profession) => (
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

            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Filtrele
              </button>

              <a
                href="/firsatlar"
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Temizle
              </a>
            </div>
          </form>
        </section>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
            <p className="font-semibold">Fırsatlar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        ) : null}

        <section className="grid gap-5 py-10 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="flex min-h-[24rem] flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-blue-400/40 hover:bg-white/[0.07]"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                    {opportunity.opportunity_type}
                  </span>

                  {opportunity.is_featured ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                      Öne çıkan
                    </span>
                  ) : null}
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  {opportunity.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {opportunity.organization}
                </p>

                <p className="mt-5 line-clamp-4 flex-1 text-sm leading-6 text-slate-300">
                  {opportunity.description ||
                    "Bu fırsat için açıklama henüz eklenmemiştir."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {opportunity.profession_area ? (
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                      {opportunity.profession_area}
                    </span>
                  ) : null}

                  {opportunity.city ? (
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                      {opportunity.city}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${getDeadlineClass(
                      opportunity.deadline
                    )}`}
                  >
                    {getDeadlineLabel(opportunity.deadline)}
                  </span>

                  <a
                    href={opportunity.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    Kaynağa git
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-slate-400">
              Bu filtrelere uygun aktif fırsat bulunamadı.
            </div>
          )}
        </section>

        <footer className="border-t border-white/10 py-8">
          <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 KariyerAtlas. Tüm hakları saklıdır.</p>

            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:info@kariyeratlas.com"
                className="transition hover:text-white"
              >
                info@kariyeratlas.com
              </a>
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