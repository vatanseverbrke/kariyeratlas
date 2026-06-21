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

type PageProps = {
  searchParams?: Promise<{
    opportunity_create?: string;
    opportunity_update?: string;
    opportunity_delete?: string;
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
  "Diğer",
];

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
  if (status === "active") return "bg-emerald-500/15 text-emerald-300";
  if (status === "draft") return "bg-amber-500/15 text-amber-300";
  if (status === "archived") return "bg-slate-500/15 text-slate-300";
  return "bg-slate-500/15 text-slate-300";
}

function getFeedback(params: Awaited<PageProps["searchParams"]>) {
  if (params?.opportunity_create === "success") {
    return {
      title: "Fırsat eklendi.",
      text: "Yeni fırsat başarıyla kaydedildi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.opportunity_update === "success") {
    return {
      title: "Fırsat güncellendi.",
      text: "Fırsat durumu ve öne çıkan bilgisi başarıyla güncellendi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.opportunity_delete === "success") {
    return {
      title: "Fırsat silindi.",
      text: "Seçilen fırsat kalıcı olarak silindi.",
      className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (params?.opportunity_create === "missing_fields") {
    return {
      title: "Eksik bilgi var.",
      text: "Başlık, kurum, fırsat türü ve kaynak linki zorunludur.",
      className: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    };
  }

  if (
    params?.opportunity_create ||
    params?.opportunity_update ||
    params?.opportunity_delete
  ) {
    return {
      title: "İşlem tamamlanamadı.",
      text: "Kısa bir süre sonra tekrar deneyebilirsin.",
      className: "border-red-400/30 bg-red-400/10 text-red-200",
    };
  }

  return null;
}

export default async function AdminFirsatlarPage({ searchParams }: PageProps) {
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
    .from("opportunities")
    .select(
      "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline,status,is_featured,created_at"
    )
    .order("created_at", { ascending: false });

  const opportunities = (data || []) as Opportunity[];

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
              Fırsat Yönetimi
            </h1>

            <p className="mt-3 text-slate-400">
              Yeni fırsat ekle, mevcut fırsatları güncelle, arşivle veya sil.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/firsatlar"
              target="_blank"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Canlı fırsat sayfası
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Toplam fırsat</p>
              <p className="mt-1 text-3xl font-semibold">
                {opportunities.length}
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
            <p className="font-semibold">Fırsatlar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        ) : null}

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Yeni fırsat ekle</h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Zorunlu alanlar: başlık, kurum, fırsat türü ve kaynak linki.
            </p>

            <form
              action="/admin/opportunities/create"
              method="post"
              className="mt-6 space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Başlık
                </label>
                <input
                  name="title"
                  required
                  placeholder="Örn. Şehir Plancısı Alımı"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Kurum / Firma
                </label>
                <input
                  name="organization"
                  required
                  placeholder="Örn. İstanbul Büyükşehir Belediyesi"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Fırsat türü
                  </label>
                  <select
                    name="opportunity_type"
                    required
                    defaultValue=""
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                  >
                    <option value="">Seçiniz</option>
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
                    name="profession_area"
                    defaultValue=""
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                  >
                    <option value="">Seçiniz</option>
                    {professionAreas.map((profession) => (
                      <option key={profession} value={profession}>
                        {profession}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Şehir
                  </label>
                  <select
                    name="city"
                    defaultValue=""
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                  >
                    <option value="">Seçiniz</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Son başvuru tarihi
                  </label>
                  <input
                    name="deadline"
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Kaynak linki
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
                  Açıklama
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Fırsatla ilgili kısa açıklama..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Durum
                  </label>
                  <select
                    name="status"
                    defaultValue="active"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
                  >
                    <option value="active">active</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    name="is_featured"
                    className="h-4 w-4 accent-blue-600"
                  />
                  Öne çıkan fırsat
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
              >
                Fırsatı kaydet
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-2xl font-semibold">Mevcut fırsatlar</h2>

            <div className="mt-6 space-y-4">
              {opportunities.length > 0 ? (
                opportunities.map((opportunity) => (
                  <article
                    key={opportunity.id}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                            {opportunity.opportunity_type}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${statusClass(
                              opportunity.status
                            )}`}
                          >
                            {opportunity.status}
                          </span>

                          {opportunity.is_featured ? (
                            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                              Öne çıkan
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-xl font-semibold">
                          {opportunity.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {opportunity.organization}
                        </p>
                      </div>

                      <a
                        href={opportunity.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-white/10 px-4 py-2 text-center text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Kaynak
                      </a>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                      {opportunity.profession_area ? (
                        <span className="rounded-full bg-white/[0.06] px-3 py-1">
                          {opportunity.profession_area}
                        </span>
                      ) : null}

                      {opportunity.city ? (
                        <span className="rounded-full bg-white/[0.06] px-3 py-1">
                          {opportunity.city}
                        </span>
                      ) : null}

                      <span className="rounded-full bg-white/[0.06] px-3 py-1">
                        Son başvuru: {formatDate(opportunity.deadline)}
                      </span>
                    </div>

                    {opportunity.description ? (
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {opportunity.description}
                      </p>
                    ) : null}

                    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Fırsat ayarları
                      </p>

                      <form
                        action={`/admin/opportunities/${opportunity.id}/update`}
                        method="post"
                        className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <select
                            name="status"
                            defaultValue={opportunity.status}
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition focus:border-blue-400"
                          >
                            <option value="active">active</option>
                            <option value="draft">draft</option>
                            <option value="archived">archived</option>
                          </select>

                          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              name="is_featured"
                              defaultChecked={opportunity.is_featured}
                              className="h-4 w-4 accent-blue-600"
                            />
                            Öne çıkan
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                        >
                          Güncelle
                        </button>
                      </form>

                      <form
                        action={`/admin/opportunities/${opportunity.id}/delete`}
                        method="post"
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-400/20"
                        >
                          Kalıcı olarak sil
                        </button>
                      </form>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      Eklenme: {formatDateTime(opportunity.created_at)}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center text-slate-400">
                  Henüz fırsat kaydı yok.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}