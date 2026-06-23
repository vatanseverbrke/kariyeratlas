import { createClient } from "@supabase/supabase-js";
import { cities, professionAreas } from "@/lib/options";

export const dynamic = "force-dynamic";

type OpportunitySource = {
  id: string;
  name: string;
  source_url: string;
  source_type: string;
  profession_area: string | null;
  city: string | null;
  is_active: boolean;
  last_checked_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  created_at: string;
};

type PageProps = {
  searchParams?: Promise<{
    source_create?: string;
    source_update?: string;
    source_delete?: string;
    status?: string;
    group?: string;
    city?: string;
    source_type?: string;
    q?: string;
    page?: string;
  }>;
};

const sourceTypes = ["web_page", "rss_feed", "api", "api_or_dynamic", "other"];

const pageSize = 50;

const statusOptions = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif" },
  { value: "passive", label: "Pasif" },
  { value: "error", label: "Hatalı" },
  { value: "successful", label: "Başarılı" },
  { value: "waiting", label: "Bekleyen / hiç kontrol edilmemiş" },
  { value: "active_successful", label: "Başarılı aktif" },
  { value: "active_error", label: "Hatalı aktif" },
  { value: "active_waiting", label: "Bekleyen aktif" },
];

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sourceGroup(source: OpportunitySource) {
  const name = source.name || "";
  const url = source.source_url || "";
  const sourceType = source.source_type || "";
  const professionArea = source.profession_area || "";
  const city = source.city || "";

  if (
    professionArea === "RSS / API" ||
    sourceType === "rss_feed" ||
    sourceType === "api_or_dynamic"
  ) {
    return "RSS / API";
  }

  if (professionArea === "Uluslararası Kurum / Fon" || city === "Uluslararası") {
    return "Uluslararası Kurum / Fon";
  }

  if (professionArea === "Resmi Duyuru / İlan") {
    return "Resmi Duyuru / İlan";
  }

  if (professionArea === "Valilik" || name.includes("Valiliği")) {
    return "Valilik";
  }

  if (
    professionArea === "Proje / Yarışma / Destek" ||
    name.includes("TEKNOFEST") ||
    name.includes("TÜBİTAK") ||
    name.includes("TUBITAK") ||
    name.includes("KOSGEB") ||
    name.includes("Kalkınma Ajansı") ||
    name.includes("Ulusal Ajansı") ||
    name.includes("Güncel Hibeler")
  ) {
    return "Proje / Yarışma / Destek";
  }

  if (
    name.includes("Üniversitesi") ||
    name.includes("ODTÜ") ||
    name.includes("ODTU") ||
    url.includes("metu.edu.tr") ||
    url.includes(".edu.tr")
  ) {
    return "Üniversite";
  }

  if (
    name.includes("Bakanlığı") ||
    name.includes("Başkanlığı") ||
    name.includes("Genel Müdürlüğü") ||
    [
      "Kamu İlan Personel Alımı",
      "Kariyer Kapısı Kamu İşe Alım",
      "İŞKUR Kamu Memur Alım İlanları",
      "İlan.gov.tr Personel Alımı",
      "Resmi Gazete İlanları",
      "YÖK Duyurular",
      "ÖSYM Duyurular",
      "BTK Duyurular",
      "EPDK Duyurular",
      "SPK Duyurular",
      "BDDK Duyurular",
      "KVKK Duyurular",
      "KGK Duyurular",
    ].includes(name)
  ) {
    return "Merkezi Kamu";
  }

  if (
    [
      "İş / Kariyer Platformu",
      "Freelance / Proje",
      "Akademik / Araştırma",
      "Tasarım / Yaratıcı İşler",
      "Mimarlık / Tasarım",
      "Peyzaj / Planlama",
      "Şehir ve Bölge Planlama",
      "Sektörel İş",
    ].includes(professionArea)
  ) {
    return "İş / Kariyer Platformu";
  }

  if (professionArea === "Özel Sektör") {
    return "Özel Sektör";
  }

  if (
    professionArea === "Teknopark / OSB" ||
    name.includes("Teknopark") ||
    name.includes("Teknokent") ||
    name.includes("OSB") ||
    name.includes("Organize Sanayi")
  ) {
    return "Teknopark / OSB";
  }

  if (name.includes("İlçe Belediyesi")) return "İlçe Belediyesi";
  if (name.includes("İl Özel İdaresi")) return "İl Özel İdaresi";
  if (name.includes("İl Belediyesi")) return "İl Belediyesi";
  if (name.includes("Büyükşehir Belediyesi")) return "Büyükşehir Belediyesi";

  if (
    professionArea === "Sanayi ve Ticaret" ||
    name.includes("Ticaret Odası") ||
    name.includes("Sanayi Odası") ||
    name.includes("Ticaret ve Sanayi Odası") ||
    name.includes("TOBB")
  ) {
    return "Ticaret / Sanayi Odası";
  }

  if (
    professionArea === "Meslek Odaları" ||
    name.includes("TMMOB") ||
    name.includes("Şehir Plancıları Odası") ||
    name.includes("Mimarlar Odası") ||
    name.includes("Mühendisleri Odası") ||
    name.includes("Barolar Birliği") ||
    name.includes("TÜRMOB") ||
    name.includes("Tabipleri Birliği") ||
    name.includes("Eczacıları Birliği") ||
    name.includes("Dişhekimleri Birliği") ||
    name.includes("Veteriner Hekimleri Birliği")
  ) {
    return "Meslek Odası";
  }

  return "Diğer";
}

function healthStatusText(source: OpportunitySource) {
  if (source.last_error) return "hatalı";
  if (source.last_success_at) return "başarılı";
  if (!source.last_checked_at) return "bekleyen";
  return "kontrol edildi";
}

function healthStatusClass(source: OpportunitySource) {
  if (source.last_error) return "bg-red-500/15 text-red-300";
  if (source.last_success_at) return "bg-emerald-500/15 text-emerald-300";
  if (!source.last_checked_at) return "bg-amber-500/15 text-amber-300";
  return "bg-blue-500/15 text-blue-300";
}

function activityClass(source: OpportunitySource) {
  if (source.is_active) return "bg-cyan-500/15 text-cyan-300";
  return "bg-slate-500/15 text-slate-300";
}

function activityText(source: OpportunitySource) {
  return source.is_active ? "aktif" : "pasif";
}

function matchesStatus(source: OpportunitySource, status: string) {
  switch (status) {
    case "active":
      return source.is_active;
    case "passive":
      return !source.is_active;
    case "error":
      return Boolean(source.last_error);
    case "successful":
      return Boolean(source.last_success_at);
    case "waiting":
      return !source.last_checked_at;
    case "active_successful":
      return source.is_active && Boolean(source.last_success_at);
    case "active_error":
      return source.is_active && Boolean(source.last_error);
    case "active_waiting":
      return source.is_active && !source.last_checked_at;
    case "all":
    default:
      return true;
  }
}

function getFeedback(params: Awaited<PageProps["searchParams"]>) {
  if (params?.source_create === "success") {
    return {
      title: "Kaynak eklendi.",
      text: "Yeni tarama kaynağı başarıyla kaydedildi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.source_update === "success") {
    return {
      title: "Kaynak güncellendi.",
      text: "Kaynak bilgileri başarıyla güncellendi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.source_delete === "success") {
    return {
      title: "Kaynak silindi.",
      text: "Seçilen kaynak sistemden kaldırıldı.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.source_create === "missing_fields") {
    return {
      title: "Eksik bilgi var.",
      text: "Kaynak adı ve kaynak URL zorunludur.",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  if (params?.source_create === "invalid_url" || params?.source_update === "invalid_url") {
    return {
      title: "Kaynak URL geçersiz.",
      text: "Lütfen https:// ile başlayan geçerli bir kaynak adresi gir.",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  if (params?.source_create || params?.source_update || params?.source_delete) {
    return {
      title: "İşlem tamamlanamadı.",
      text: "Kısa bir süre sonra tekrar deneyebilirsin.",
      className: "border-red-400/30 bg-red-400/10 text-red-200",
    };
  }

  return null;
}

function safePage(value: string | undefined, maxPage: number) {
  const parsed = Number(value || "1");

  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  if (parsed > maxPage) return maxPage;

  return Math.floor(parsed);
}

export default async function AdminKaynaklarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const feedback = getFeedback(params);

  const filterStatus = params?.status || "all";
  const filterGroup = params?.group || "all";
  const filterCity = params?.city || "all";
  const filterSourceType = params?.source_type || "all";
  const searchQuery = (params?.q || "").trim();

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

  const { data, error } = await supabase
    .from("opportunity_sources")
    .select(
      "id,name,source_url,source_type,profession_area,city,is_active,last_checked_at,last_success_at,last_error,created_at"
    )
    .order("is_active", { ascending: false })
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });

  const sources = (data || []) as OpportunitySource[];

  const groupOptions = Array.from(new Set(sources.map((source) => sourceGroup(source)))).sort();
  const cityOptions = Array.from(
    new Set(sources.map((source) => source.city).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "tr"));

  const sourceTypeOptions = Array.from(
    new Set(sources.map((source) => source.source_type).filter(Boolean))
  ).sort();

  const filteredSources = sources.filter((source) => {
    const group = sourceGroup(source);
    const queryTarget = `${source.name} ${source.source_url} ${source.city || ""} ${
      source.profession_area || ""
    } ${group}`.toLocaleLowerCase("tr-TR");

    const matchesQuery =
      !searchQuery ||
      queryTarget.includes(searchQuery.toLocaleLowerCase("tr-TR"));

    return (
      matchesStatus(source, filterStatus) &&
      (filterGroup === "all" || group === filterGroup) &&
      (filterCity === "all" || source.city === filterCity) &&
      (filterSourceType === "all" || source.source_type === filterSourceType) &&
      matchesQuery
    );
  });

  const totalCount = sources.length;
  const activeCount = sources.filter((source) => source.is_active).length;
  const passiveCount = sources.filter((source) => !source.is_active).length;
  const errorCount = sources.filter((source) => source.last_error).length;
  const successCount = sources.filter((source) => source.last_success_at).length;
  const waitingCount = sources.filter((source) => !source.last_checked_at).length;
  const activeErrorCount = sources.filter(
    (source) => source.is_active && source.last_error
  ).length;
  const activeSuccessCount = sources.filter(
    (source) => source.is_active && source.last_success_at
  ).length;
  const activeWaitingCount = sources.filter(
    (source) => source.is_active && !source.last_checked_at
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredSources.length / pageSize));
  const currentPage = safePage(params?.page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSources = filteredSources.slice(startIndex, startIndex + pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams();

    const values: Record<string, string | undefined> = {
      status: filterStatus,
      group: filterGroup,
      city: filterCity,
      source_type: filterSourceType,
      q: searchQuery,
      page: String(currentPage),
      ...overrides,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (!value) return;
      if (key === "status" && value === "all") return;
      if (key === "group" && value === "all") return;
      if (key === "city" && value === "all") return;
      if (key === "source_type" && value === "all") return;
      if (key === "page" && value === "1") return;
      if (key === "q" && !value.trim()) return;

      next.set(key, value);
    });

    const query = next.toString();

    return query ? `/admin/kaynaklar?${query}` : "/admin/kaynaklar";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <a
              href="/admin"
              className="text-sm text-blue-300 hover:text-blue-200"
            >
              ← Admin paneline dön
            </a>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight">
              Kaynak Yönetimi
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Günlük ücretsiz tarama sisteminin kontrol edeceği kaynakları
              buradan yönetebilirsin. Kaynakları durum, grup, şehir ve tür
              bazında filtreleyebilirsin.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="/api/ai-opportunities/check"
              target="_blank"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Manuel tarama çalıştır
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Aktif kaynak</p>
              <p className="mt-1 text-3xl font-semibold">{activeCount}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Hatalı kaynak</p>
              <p className="mt-1 text-3xl font-semibold">{errorCount}</p>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={`mt-8 rounded-3xl border p-5 text-sm ${feedback.className}`}
          >
            <p className="font-semibold">{feedback.title}</p>
            <p className="mt-1 opacity-90">{feedback.text}</p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-200">
            <p className="font-semibold">Kaynaklar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        ) : null}

        <section className="mt-8 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          <a
            href={buildUrl({ status: "all", page: "1" })}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Toplam
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalCount}</p>
          </a>

          <a
            href={buildUrl({ status: "active", page: "1" })}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 transition hover:bg-cyan-400/15"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
              Aktif
            </p>
            <p className="mt-2 text-2xl font-semibold">{activeCount}</p>
          </a>

          <a
            href={buildUrl({ status: "passive", page: "1" })}
            className="rounded-2xl border border-slate-400/20 bg-slate-400/10 p-4 transition hover:bg-slate-400/15"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
              Pasif
            </p>
            <p className="mt-2 text-2xl font-semibold">{passiveCount}</p>
          </a>

          <a
            href={buildUrl({ status: "error", page: "1" })}
            className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 transition hover:bg-red-400/15"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-red-300">
              Hatalı
            </p>
            <p className="mt-2 text-2xl font-semibold">{errorCount}</p>
          </a>

          <a
            href={buildUrl({ status: "successful", page: "1" })}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 transition hover:bg-emerald-400/15"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
              Başarılı
            </p>
            <p className="mt-2 text-2xl font-semibold">{successCount}</p>
          </a>

          <a
            href={buildUrl({ status: "waiting", page: "1" })}
            className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 transition hover:bg-amber-400/15"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-amber-300">
              Bekleyen
            </p>
            <p className="mt-2 text-2xl font-semibold">{waitingCount}</p>
          </a>

          <a
            href={buildUrl({ status: "active_successful", page: "1" })}
            className="rounded-2xl border border-emerald-400/20 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Başarılı aktif
            </p>
            <p className="mt-2 text-2xl font-semibold">{activeSuccessCount}</p>
          </a>

          <a
            href={buildUrl({ status: "active_error", page: "1" })}
            className="rounded-2xl border border-red-400/20 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Hatalı aktif
            </p>
            <p className="mt-2 text-2xl font-semibold">{activeErrorCount}</p>
          </a>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Filtreler</h2>
              <p className="mt-2 text-sm text-slate-400">
                {totalCount} kaynak içinde {filteredSources.length} sonuç bulundu.
                Sayfa başına {pageSize} kaynak gösteriliyor.
              </p>
            </div>

            <a
              href="/admin/kaynaklar"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Filtreleri temizle
            </a>
          </div>

          <form
            method="get"
            action="/admin/kaynaklar"
            className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1.4fr_auto]"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Durum
              </label>
              <select
                name="status"
                defaultValue={filterStatus}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Kaynak grubu
              </label>
              <select
                name="group"
                defaultValue={filterGroup}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="all">Tüm gruplar</option>
                {groupOptions.map((group) => (
                  <option key={group} value={group}>
                    {group}
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
                defaultValue={filterCity}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="all">Tüm şehirler</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Tür
              </label>
              <select
                name="source_type"
                defaultValue={filterSourceType}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="all">Tüm türler</option>
                {sourceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Arama
              </label>
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Kaynak adı, URL, şehir, grup..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <input type="hidden" name="page" value="1" />

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Filtrele
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-2xl font-semibold">Yeni kaynak ekle</h2>

          <form
            action="/admin/sources/create"
            method="post"
            className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr_0.8fr_0.8fr_0.8fr_auto]"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Kaynak adı
              </label>
              <input
                name="name"
                required
                placeholder="Örn. TÜBİTAK Yarışmalar"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Kaynak URL
              </label>
              <input
                name="source_url"
                required
                type="url"
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Tür
              </label>
              <select
                name="source_type"
                defaultValue="web_page"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                {sourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
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
                defaultValue="Türkiye Geneli"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Belirsiz</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Meslek alanı
              </label>
              <select
                name="profession_area"
                defaultValue=""
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="">Genel</option>
                {professionAreas.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Ekle
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 space-y-5">
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
              {filteredSources.length} sonuçtan{" "}
              {filteredSources.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, filteredSources.length)} arası
              gösteriliyor.
            </p>

            <div className="flex gap-3">
              <a
                href={buildUrl({ page: String(Math.max(1, currentPage - 1)) })}
                className={`rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold transition ${
                  currentPage <= 1
                    ? "pointer-events-none text-slate-600"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Önceki
              </a>

              <span className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <a
                href={buildUrl({ page: String(Math.min(totalPages, currentPage + 1)) })}
                className={`rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold transition ${
                  currentPage >= totalPages
                    ? "pointer-events-none text-slate-600"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Sonraki
              </a>
            </div>
          </div>

          {paginatedSources.length > 0 ? (
            paginatedSources.map((source) => (
              <article
                key={source.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${healthStatusClass(
                          source
                        )}`}
                      >
                        {healthStatusText(source)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${activityClass(
                          source
                        )}`}
                      >
                        {activityText(source)}
                      </span>

                      <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-300">
                        {sourceGroup(source)}
                      </span>

                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                        {source.source_type}
                      </span>

                      {source.city ? (
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                          {source.city}
                        </span>
                      ) : null}

                      {source.profession_area ? (
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                          {source.profession_area}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold">
                      {source.name}
                    </h2>

                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm text-blue-300 hover:text-blue-200"
                    >
                      {source.source_url}
                    </a>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-3 lg:min-w-[520px]">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Son kontrol
                      </p>
                      <p className="mt-2 text-slate-300">
                        {formatDateTime(source.last_checked_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Son başarı
                      </p>
                      <p className="mt-2 text-slate-300">
                        {formatDateTime(source.last_success_at)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Son hata
                      </p>
                      <p className="mt-2 line-clamp-3 text-slate-300">
                        {source.last_error || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <details className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                    Kaynağı düzenle
                  </summary>

                  <form
                    action={`/admin/sources/${source.id}/update`}
                    method="post"
                    className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.4fr_0.8fr_0.8fr_0.8fr_0.6fr_auto]"
                  >
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Kaynak adı
                      </label>
                      <input
                        name="name"
                        required
                        defaultValue={source.name}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Kaynak URL
                      </label>
                      <input
                        name="source_url"
                        required
                        type="url"
                        defaultValue={source.source_url}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Tür
                      </label>
                      <select
                        name="source_type"
                        defaultValue={source.source_type}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      >
                        {sourceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
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
                        defaultValue={source.city || ""}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      >
                        <option value="">Belirsiz</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Meslek
                      </label>
                      <select
                        name="profession_area"
                        defaultValue={source.profession_area || ""}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                      >
                        <option value="">Genel</option>
                        {professionAreas.map((profession) => (
                          <option key={profession} value={profession}>
                            {profession}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 lg:mt-7">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={source.is_active}
                        className="h-4 w-4 accent-blue-600"
                      />
                      Aktif
                    </label>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        Güncelle
                      </button>
                    </div>
                  </form>

                  <form
                    action={`/admin/sources/${source.id}/delete`}
                    method="post"
                    className="mt-4"
                  >
                    <button
                      type="submit"
                      className="rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
                    >
                      Kaynağı sil
                    </button>
                  </form>
                </details>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-lg font-semibold text-white">
                Bu filtreye uygun kaynak yok.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Filtreleri temizleyerek tüm kaynakları görüntüleyebilirsin.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
