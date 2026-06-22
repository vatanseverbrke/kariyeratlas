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
  }>;
};

const sourceTypes = ["web_page", "rss_feed", "api", "other"];

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sourceStatusClass(source: OpportunitySource) {
  if (!source.is_active) return "bg-slate-500/15 text-slate-300";
  if (source.last_error) return "bg-red-500/15 text-red-300";
  if (source.last_success_at) return "bg-emerald-500/15 text-emerald-300";
  return "bg-amber-500/15 text-amber-300";
}

function sourceStatusText(source: OpportunitySource) {
  if (!source.is_active) return "pasif";
  if (source.last_error) return "hatalı";
  if (source.last_success_at) return "başarılı";
  return "bekliyor";
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

export default async function AdminKaynaklarPage({ searchParams }: PageProps) {
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

  const { data, error } = await supabase
    .from("opportunity_sources")
    .select(
      "id,name,source_url,source_type,profession_area,city,is_active,last_checked_at,last_success_at,last_error,created_at"
    )
    .order("is_active", { ascending: false })
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false });

  const sources = (data || []) as OpportunitySource[];

  const activeCount = sources.filter((source) => source.is_active).length;
  const errorCount = sources.filter((source) => source.last_error).length;

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
              buradan yönetebilirsin. Hata veren kaynakları pasifleştirebilir,
              yeni kaynak ekleyebilir veya mevcut kaynakları güncelleyebilirsin.
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
          {sources.length > 0 ? (
            sources.map((source) => (
              <article
                key={source.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${sourceStatusClass(
                          source
                        )}`}
                      >
                        {sourceStatusText(source)}
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
                Henüz kaynak yok.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Yeni kaynak ekleyerek günlük tarama sistemini besleyebilirsin.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
