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

type AdminPageProps = {
  searchParams?: Promise<{
    status_update?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  if (status === "contacted") return "contacted";
  if (status === "waiting") return "waiting";
  if (status === "archived") return "archived";
  return "new";
}

function getStatusClass(status: string) {
  if (status === "contacted") {
    return "bg-blue-500/15 text-blue-300";
  }

  if (status === "waiting") {
    return "bg-amber-500/15 text-amber-300";
  }

  if (status === "archived") {
    return "bg-slate-500/15 text-slate-300";
  }

  return "bg-emerald-500/15 text-emerald-300";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const statusUpdate = params?.status_update;

  const feedback =
    statusUpdate === "success"
      ? {
          title: "Durum güncellendi.",
          text: "Kayıt durumu başarıyla değiştirildi.",
          className:
            "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
        }
      : statusUpdate === "error" ||
          statusUpdate === "config_error" ||
          statusUpdate === "invalid_status"
        ? {
            title: "Durum güncellenemedi.",
            text: "Kısa bir süre sonra tekrar deneyebilirsin.",
            className: "border-red-400/30 bg-red-400/10 text-red-200",
          }
        : null;

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
    .from("early_access_signups")
    .select("id,email,profession,city,source,status,created_at")
    .order("created_at", { ascending: false });

  const signups = (data || []) as Signup[];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <a href="/" className="text-sm text-blue-300 hover:text-blue-200">
              ← Ana sayfaya dön
            </a>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight">
              KariyerAtlas Admin
            </h1>

            <p className="mt-3 text-slate-400">
              Erken erişim formundan gelen kayıtları buradan takip edebilirsin.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/admin/firsatlar"
              className="rounded-2xl border border-white/10 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Fırsat yönetimi
            </a>

            <a
              href="/admin/export"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
            >
              CSV indir
            </a>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-4">
              <p className="text-sm text-slate-400">Toplam kayıt</p>
              <p className="mt-1 text-3xl font-semibold">{signups.length}</p>
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
            <p className="font-semibold">Kayıtlar alınamadı.</p>
            <p className="mt-2 text-sm opacity-90">{error.message}</p>
          </div>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-5 py-4 font-medium">E-posta</th>
                  <th className="px-5 py-4 font-medium">Meslek / Alan</th>
                  <th className="px-5 py-4 font-medium">Şehir</th>
                  <th className="px-5 py-4 font-medium">Durum</th>
                  <th className="px-5 py-4 font-medium">Durum Güncelle</th>
                  <th className="px-5 py-4 font-medium">Kaynak</th>
                  <th className="px-5 py-4 font-medium">Kayıt Tarihi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {signups.length > 0 ? (
                  signups.map((signup) => (
                    <tr key={signup.id} className="hover:bg-white/[0.04]">
                      <td className="whitespace-nowrap px-5 py-4 text-white">
                        {signup.email}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                        {signup.profession || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                        {signup.city || "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusClass(
                            signup.status
                          )}`}
                        >
                          {getStatusLabel(signup.status)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <form
                          action={`/admin/signups/${signup.id}/status`}
                          method="post"
                          className="flex items-center gap-2"
                        >
                          <select
                            name="status"
                            defaultValue={signup.status}
                            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition focus:border-blue-400"
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="waiting">waiting</option>
                            <option value="archived">archived</option>
                          </select>

                          <button
                            type="submit"
                            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                          >
                            Güncelle
                          </button>
                        </form>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                        {signup.source}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                        {formatDate(signup.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-400"
                    >
                      Henüz erken erişim kaydı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}