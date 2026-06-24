import { createClient } from "@supabase/supabase-js";
import { cities, opportunityTypes, professionAreas } from "@/lib/options";

export const dynamic = "force-dynamic";

type Candidate = {
  id: string;
  title: string;
  organization: string | null;
  opportunity_type: string | null;
  profession_area: string | null;
  city: string | null;
  description: string | null;
  source_url: string;
  deadline: string | null;
  ai_summary: string | null;
  ai_reason: string | null;
  ai_confidence: number | null;
  review_status: string;
  created_at: string;
};

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    profession?: string;
    type?: string;
    city?: string;
    q?: string;
    candidate_approve?: string;
    candidate_reject?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "pending") return "bg-amber-500/15 text-amber-300";
  if (status === "approved") return "bg-emerald-500/15 text-emerald-300";
  if (status === "rejected") return "bg-red-500/15 text-red-300";
  if (status === "duplicate") return "bg-slate-500/15 text-slate-300";
  return "bg-slate-500/15 text-slate-300";
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).sort((a, b) => a.localeCompare(b, "tr"));
}

function cleanSearch(value: string) {
  return value.trim().replace(/[,%]/g, "").slice(0, 80);
}

function getFeedback(params: Awaited<PageProps["searchParams"]>) {
  if (params?.candidate_approve === "success") {
    return {
      title: "Aday fırsat yayına alındı.",
      text: "Seçilen aday fırsat aktif fırsatlar tablosuna aktarıldı.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.candidate_approve === "duplicate") {
    return {
      title: "Bu fırsat zaten yayında.",
      text: "Aynı kaynak linkine sahip bir fırsat bulunduğu için tekrar eklenmedi.",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  if (params?.candidate_reject === "success") {
    return {
      title: "Aday fırsat reddedildi.",
      text: "Seçilen aday fırsat reddedildi olarak işaretlendi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.candidate_approve || params?.candidate_reject) {
    return {
      title: "İşlem tamamlanamadı.",
      text: "Kısa bir süre sonra tekrar deneyebilirsin.",
      className: "border-red-400/30 bg-red-400/10 text-red-200",
    };
  }

  return null;
}

export default async function CandidateOpportunitiesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const selectedStatus = params?.status || "pending";
  const selectedProfession = params?.profession || "all";
  const selectedType = params?.type || "all";
  const selectedCity = params?.city || "all";
  const searchTerm = cleanSearch(params?.q || "");
  const feedback = getFeedback(params);

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

  const [professionRowsResult, typeRowsResult, cityRowsResult] = await Promise.all([
    supabase
      .from("opportunity_candidates")
      .select("profession_area")
      .not("profession_area", "is", null)
      .limit(1000),
    supabase
      .from("opportunity_candidates")
      .select("opportunity_type")
      .not("opportunity_type", "is", null)
      .limit(1000),
    supabase
      .from("opportunity_candidates")
      .select("city")
      .not("city", "is", null)
      .limit(1000),
  ]);

  const professionOptions = uniqueValues([
    ...professionAreas,
    ...((professionRowsResult.data || []).map((row) => row.profession_area) || []),
  ]);

  const typeOptions = uniqueValues([
    ...opportunityTypes,
    ...((typeRowsResult.data || []).map((row) => row.opportunity_type) || []),
  ]);

  const cityOptions = uniqueValues([
    ...cities,
    ...((cityRowsResult.data || []).map((row) => row.city) || []),
  ]);

  let query = supabase
    .from("opportunity_candidates")
    .select(
      "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline,ai_summary,ai_reason,ai_confidence,review_status,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(120);

  if (selectedStatus !== "all") {
    query = query.eq("review_status", selectedStatus);
  }

  if (selectedProfession !== "all") {
    query = query.eq("profession_area", selectedProfession);
  }

  if (selectedType !== "all") {
    query = query.eq("opportunity_type", selectedType);
  }

  if (selectedCity !== "all") {
    query = query.eq("city", selectedCity);
  }

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,organization.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  const { data, error } = await query;
  const candidates = (data || []) as Candidate[];

  const { count: pendingCount } = await supabase
    .from("opportunity_candidates")
    .select("id", { count: "exact", head: true })
    .eq("review_status", "pending");

  const { count: filteredCount } = await supabase
    .from("opportunity_candidates")
    .select("id", { count: "exact", head: true })
    .match(
      Object.fromEntries(
        [
          selectedStatus !== "all" ? ["review_status", selectedStatus] : null,
          selectedProfession !== "all" ? ["profession_area", selectedProfession] : null,
          selectedType !== "all" ? ["opportunity_type", selectedType] : null,
          selectedCity !== "all" ? ["city", selectedCity] : null,
        ].filter(Boolean) as Array<[string, string]>
      )
    );

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
              Aday Fırsatlar
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Günlük ücretsiz tarama sistemiyle yakalanan fırsat adaylarını
              meslek, ilan türü, şehir ve inceleme durumuna göre filtreleyip
              uygun olanları yayına alabilirsin.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="/admin/firsatlar"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Fırsat yönetimi
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Onay bekleyen</p>
              <p className="mt-1 text-3xl font-semibold">
                {pendingCount || 0}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Filtre sonucu</p>
              <p className="mt-1 text-3xl font-semibold">
                {searchTerm ? candidates.length : filteredCount || candidates.length}
              </p>
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
            <p className="font-semibold">Aday fırsatlar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        ) : null}

        <form className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="grid gap-4 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Arama
              </label>
              <input
                name="q"
                defaultValue={searchTerm}
                placeholder="Başlık, kurum, açıklama..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                İnceleme durumu
              </label>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="pending">Onay bekleyen</option>
                <option value="approved">Onaylanan</option>
                <option value="rejected">Reddedilen</option>
                <option value="duplicate">Tekrar eden</option>
                <option value="all">Tümü</option>
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
                <option value="all">Tüm meslekler</option>
                {professionOptions.map((profession) => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                İlan türü
              </label>
              <select
                name="type"
                defaultValue={selectedType}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              >
                <option value="all">Tüm türler</option>
                {typeOptions.map((type) => (
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
                defaultValue={selectedCity}
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
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Filtrele
            </button>

            <a
              href="/admin/aday-firsatlar"
              className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Filtreleri temizle
            </a>
          </div>
        </form>

        <section className="mt-8 space-y-5">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${statusClass(
                          candidate.review_status
                        )}`}
                      >
                        {candidate.review_status}
                      </span>

                      {candidate.opportunity_type ? (
                        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                          {candidate.opportunity_type}
                        </span>
                      ) : null}

                      {candidate.profession_area ? (
                        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">
                          {candidate.profession_area}
                        </span>
                      ) : null}

                      {candidate.ai_confidence !== null ? (
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                          Güven: {candidate.ai_confidence}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold">
                      {candidate.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {candidate.organization || "Kurum belirtilmemiş"}
                    </p>
                  </div>

                  <a
                    href={candidate.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Kaynağı aç
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
                  {candidate.city ? (
                    <span className="rounded-full bg-white/[0.06] px-3 py-1">
                      {candidate.city}
                    </span>
                  ) : null}

                  <span className="rounded-full bg-white/[0.06] px-3 py-1">
                    Son başvuru: {formatDate(candidate.deadline)}
                  </span>

                  <span className="rounded-full bg-white/[0.06] px-3 py-1">
                    Yakalanma: {formatDateTime(candidate.created_at)}
                  </span>
                </div>

                {candidate.description ? (
                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    {candidate.description}
                  </p>
                ) : null}

                {candidate.ai_reason ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
                    <p className="font-semibold text-slate-300">
                      Tarama notu
                    </p>
                    <p className="mt-2 leading-6">{candidate.ai_reason}</p>
                  </div>
                ) : null}

                {candidate.review_status === "pending" ? (
                  <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <form
                      action={`/admin/opportunity-candidates/${candidate.id}/approve`}
                      method="post"
                      className="grid gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div>
                        <label className="mb-2 block text-xs text-slate-400">
                          Yayın durumu
                        </label>
                        <select
                          name="status"
                          defaultValue="active"
                          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition focus:border-blue-400"
                        >
                          <option value="active">active</option>
                          <option value="draft">draft</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          name="is_featured"
                          className="h-4 w-4 accent-blue-600"
                        />
                        Öne çıkan
                      </label>

                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Yayına al
                      </button>
                    </form>

                    <form
                      action={`/admin/opportunity-candidates/${candidate.id}/reject`}
                      method="post"
                    >
                      <button
                        type="submit"
                        className="h-full w-full rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
                      >
                        Reddet
                      </button>
                    </form>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-lg font-semibold text-white">
                Bu filtrede aday fırsat yok.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Farklı meslek, tür veya şehir filtresi deneyebilirsin.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
