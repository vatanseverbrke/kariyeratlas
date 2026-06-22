import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Signup = {
  id: string;
  email: string;
  profession: string | null;
  city: string | null;
  source: string;
  status: string;
  created_at: string;
};

type AiRun = {
  id: string;
  status: string;
  checked_sources_count: number;
  candidates_found_count: number;
  candidates_inserted_count: number;
  duplicates_skipped_count: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
};

type PageProps = {
  searchParams?: Promise<{
    signup_update?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "new") return "bg-emerald-500/15 text-emerald-300";
  if (status === "contacted") return "bg-blue-500/15 text-blue-300";
  if (status === "approved") return "bg-purple-500/15 text-purple-300";
  if (status === "rejected") return "bg-red-500/15 text-red-300";

  if (status === "completed") return "bg-emerald-500/15 text-emerald-300";
  if (status === "running") return "bg-amber-500/15 text-amber-300";
  if (status === "failed") return "bg-red-500/15 text-red-300";

  return "bg-slate-500/15 text-slate-300";
}

function getFeedback(params: Awaited<PageProps["searchParams"]>) {
  if (params?.signup_update === "success") {
    return {
      title: "Durum güncellendi.",
      text: "Erken erişim kaydının durumu başarıyla güncellendi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.signup_update) {
    return {
      title: "Durum güncellenemedi.",
      text: "Kısa bir süre sonra tekrar deneyebilirsin.",
      className: "border-red-400/30 bg-red-400/10 text-red-200",
    };
  }

  return null;
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function ActionCard({
  title,
  text,
  href,
  badge,
}: {
  title: string;
  text: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-400/40 hover:bg-blue-500/10"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-blue-200">
          {title}
        </h3>

        {badge ? (
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </a>
  );
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
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

  const [
    signupsResult,
    opportunitiesCountResult,
    activeOpportunitiesCountResult,
    pendingCandidatesCountResult,
    sourcesCountResult,
    activeSourcesCountResult,
    errorSourcesCountResult,
    recentRunsResult,
  ] = await Promise.all([
    supabase
      .from("early_access_signups")
      .select("id,email,profession,city,source,status,created_at")
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("opportunity_candidates")
      .select("id", { count: "exact", head: true })
      .eq("review_status", "pending"),

    supabase
      .from("opportunity_sources")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("opportunity_sources")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("opportunity_sources")
      .select("id", { count: "exact", head: true })
      .not("last_error", "is", null),

    supabase
      .from("ai_opportunity_runs")
      .select(
        "id,status,checked_sources_count,candidates_found_count,candidates_inserted_count,duplicates_skipped_count,error_message,started_at,finished_at"
      )
      .order("started_at", { ascending: false })
      .limit(5),
  ]);

  const signups = (signupsResult.data || []) as Signup[];
  const recentRuns = (recentRunsResult.data || []) as AiRun[];

  const totalSignups = signups.length;
  const totalOpportunities = opportunitiesCountResult.count || 0;
  const activeOpportunities = activeOpportunitiesCountResult.count || 0;
  const pendingCandidates = pendingCandidatesCountResult.count || 0;
  const totalSources = sourcesCountResult.count || 0;
  const activeSources = activeSourcesCountResult.count || 0;
  const errorSources = errorSourcesCountResult.count || 0;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a href="/" className="text-sm text-blue-300 hover:text-blue-200">
              ← Ana sayfaya dön
            </a>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              KariyerAtlas Admin
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Erken erişim kayıtları, fırsatlar, aday fırsatlar, kaynaklar ve
              günlük tarama sistemini buradan takip edebilirsin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin/firsatlar"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Fırsat yönetimi
            </a>

            <a
              href="/admin/aday-firsatlar"
              className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20"
            >
              Aday fırsatlar
            </a>

            <a
              href="/admin/kaynaklar"
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
            >
              Kaynak yönetimi
            </a>

            <a
              href="/firsatlar"
              target="_blank"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              Canlı fırsatlar
            </a>
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Yayındaki fırsat"
            value={activeOpportunities}
            helper={`${totalOpportunities} toplam fırsat`}
          />

          <StatCard
            label="Onay bekleyen aday"
            value={pendingCandidates}
            helper="Tarama sisteminden gelen kayıtlar"
          />

          <StatCard
            label="Aktif kaynak"
            value={activeSources}
            helper={`${totalSources} toplam kaynak`}
          />

          <StatCard
            label="Hatalı kaynak"
            value={errorSources}
            helper="Son kontrolde hata verenler"
          />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <ActionCard
            title="Fırsat Yönetimi"
            text="Manuel fırsat ekle, mevcut fırsatları düzenle, öne çıkan yap, arşivle veya sil."
            href="/admin/firsatlar"
            badge="Yayın"
          />

          <ActionCard
            title="Aday Fırsatlar"
            text="Günlük taramanın bulduğu adayları incele, uygun olanları tek tıkla yayına al."
            href="/admin/aday-firsatlar"
            badge={pendingCandidates > 0 ? String(pendingCandidates) : "0"}
          />

          <ActionCard
            title="Kaynak Yönetimi"
            text="Tarama kaynaklarını ekle, düzenle, aktif-pasif yap ve hata durumlarını takip et."
            href="/admin/kaynaklar"
            badge={`${activeSources} aktif`}
          />

          <ActionCard
            title="Manuel Tarama"
            text="Günlük cron saatini beklemeden kaynak taramasını elle çalıştır."
            href="/api/ai-opportunities/check"
            badge="Cron"
          />

          <ActionCard
            title="CSV Dışa Aktar"
            text="Erken erişim kayıtlarını CSV olarak indir."
            href="/admin/export"
            badge="CSV"
          />

          <ActionCard
            title="Canlı Site Kontrolü"
            text="Public fırsatlar sayfasını yeni sekmede aç ve kullanıcı tarafını kontrol et."
            href="/firsatlar"
            badge="Public"
          />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Erken erişim kayıtları</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Son 20 kayıt burada listelenir.
                </p>
              </div>

              <a
                href="/admin/export"
                className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                CSV indir
              </a>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_0.7fr_1.2fr] bg-white/[0.06] px-5 py-4 text-sm text-slate-300 lg:grid">
                <p>E-posta</p>
                <p>Meslek / Alan</p>
                <p>Şehir</p>
                <p>Durum</p>
                <p>Durum Güncelle</p>
              </div>

              {signups.length > 0 ? (
                signups.map((signup) => (
                  <div
                    key={signup.id}
                    className="grid gap-4 border-t border-white/10 px-5 py-5 text-sm lg:grid-cols-[1.3fr_1fr_0.8fr_0.7fr_1.2fr] lg:items-center"
                  >
                    <div>
                      <p className="font-semibold text-white">{signup.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(signup.created_at)} · {signup.source}
                      </p>
                    </div>

                    <p className="text-slate-300">
                      {signup.profession || "-"}
                    </p>

                    <p className="text-slate-300">{signup.city || "-"}</p>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs ${statusClass(
                        signup.status
                      )}`}
                    >
                      {signup.status}
                    </span>

                    <form
                      action={`/admin/signups/${signup.id}/status`}
                      method="post"
                      className="flex flex-col gap-2 sm:flex-row"
                    >
                      <select
                        name="status"
                        defaultValue={signup.status}
                        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition focus:border-blue-400"
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>

                      <button
                        type="submit"
                        className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                      >
                        Güncelle
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  Henüz erken erişim kaydı yok.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Son tarama çalışmaları</h2>

            <p className="mt-2 text-sm text-slate-400">
              Günlük cron ve manuel tarama geçmişi.
            </p>

            <div className="mt-6 space-y-4">
              {recentRuns.length > 0 ? (
                recentRuns.map((run) => (
                  <article
                    key={run.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${statusClass(
                            run.status
                          )}`}
                        >
                          {run.status}
                        </span>

                        <p className="mt-3 text-sm text-slate-300">
                          {formatDateTime(run.started_at)}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {run.id.slice(0, 8)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p>Kontrol edilen</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {run.checked_sources_count}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p>Bulunan aday</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {run.candidates_found_count}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p>Eklenen aday</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {run.candidates_inserted_count}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/[0.04] p-3">
                        <p>Tekrar eden</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {run.duplicates_skipped_count}
                        </p>
                      </div>
                    </div>

                    {run.error_message ? (
                      <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-200">
                        {run.error_message}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-center text-slate-400">
                  Henüz tarama çalışması yok.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
