import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cities, professionAreas } from "@/lib/options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpportunitySource = {
  id: string;
  name: string;
  source_url: string;
  profession_area: string | null;
  city: string | null;
};

type ExtractedLink = {
  title: string;
  url: string;
  matchedKeywords: string[];
};

const jobKeywords = [
  "personel alımı",
  "personel alim",
  "personel alım",
  "personel alınacaktır",
  "personel alinacaktir",
  "sözleşmeli personel",
  "sozlesmeli personel",
  "sürekli işçi",
  "surekli isci",
  "işçi alımı",
  "isci alimi",
  "memur alımı",
  "memur alimi",
  "eleman alımı",
  "eleman alimi",
  "iş ilanı",
  "is ilani",
  "iş ilanları",
  "is ilanlari",
  "istihdam edilecektir",
  "istihdam edilmek üzere",
  "akademik personel",
  "öğretim görevlisi",
  "ogretim gorevlisi",
  "araştırma görevlisi",
  "arastirma gorevlisi",
  "uzman yardımcısı",
  "uzman yardimcisi",
];

const competitionKeywords = [
  "yarışma",
  "yarisma",
  "proje yarışması",
  "proje yarismasi",
  "fikir yarışması",
  "fikir yarismasi",
  "proje çağrısı",
  "proje cagrisi",
  "ödüllü yarışma",
  "odullu yarisma",
  "teknofest",
  "tübitak",
  "tubitak",
  "2204",
  "2209",
];

const noiseTitlePatterns = [
  "ana sayfa",
  "anasayfa",
  "home",
  "iletişim",
  "kurumsal",
  "hakkımızda",
  "site haritası",
  "gizlilik",
  "kvkk",
  "çerez",
  "facebook",
  "twitter",
  "x.com",
  "instagram",
  "youtube",
  "linkedin",
  "tüm duyurular",
  "tüm ilanlar",
  "tüm haberler",
  "devamını oku",
  "detay",
  "detaylar",
  "daha fazla",
  "başvuru takip",
  "online başvuru",
  "e-belediye",
  "e belediye",
  "talep takip",
  "çözüm merkezi",
  "beyaz masa",
  "hizmetler",
  "abonelik",
  "borç ödeme",
  "ödeme",
  "mezarlık",
  "nikah",
  "şikayet",
  "istek",
  "mezbaha başvuru",
  "proje müellif başvuru",
  "ustam başvuru",
  "çamaşırhane başvuru",
  "istihdam akademileri başvuru",
  "ko-mek başvuru",
  "kurs başvuru",
  "eğitim başvuru",
  "spor başvuru",
  "sosyal yardım",
  "yardım başvuru",
];

const ignoredExactTitles = [
  "duyurular",
  "duyuru",
  "ilanlar",
  "ilan",
  "haberler",
  "haber",
  "etkinlikler",
  "etkinlik",
  "eğitimler",
  "eğitim",
  "yarışmalar",
  "yarışma",
  "başvurular",
  "başvuru",
  "başvuru takip",
  "online başvuru",
  "hizmetler",
  "kariyer",
  "tümü",
  "listele",
  "okunabilir hale getir",
  "+",
  "\" + \"",
  "\" + \" \" + \"",
];

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal) =>
      String.fromCharCode(Number.parseInt(decimal, 10))
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToText(html: string) {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function stripHtml(value: string) {
  return htmlToText(value)
    .replace(/\s+/g, " ")
    .trim();
}

function hasAnyKeyword(text: string, keywords: string[]) {
  const lowered = text.toLocaleLowerCase("tr-TR");

  return keywords.some((keyword) =>
    lowered.includes(keyword.toLocaleLowerCase("tr-TR"))
  );
}

function getMatchedKeywords(text: string) {
  return [...jobKeywords, ...competitionKeywords].filter((keyword) =>
    text.toLocaleLowerCase("tr-TR").includes(keyword.toLocaleLowerCase("tr-TR"))
  );
}

function isCompetitionSource(sourceName: string) {
  const lowered = sourceName.toLocaleLowerCase("tr-TR");

  return (
    lowered.includes("tübitak") ||
    lowered.includes("tubitak") ||
    lowered.includes("teknofest") ||
    lowered.includes("yarışma") ||
    lowered.includes("yarisma")
  );
}

function isMunicipalitySource(sourceName: string) {
  return sourceName.toLocaleLowerCase("tr-TR").includes("belediye");
}

function isIgnoredTitle(title: string) {
  const cleanTitle = title
    .replace(/[\s\n\r\t]+/g, " ")
    .replace(/[.,:;|/\\-]+$/g, "")
    .trim();

  const lowered = cleanTitle.toLocaleLowerCase("tr-TR");

  if (cleanTitle.length < 12) return true;
  if (cleanTitle.length > 240) return true;

  const malformedTemplateSignals = [
    "item.",
    "programadi",
    "programadı",
    "egitimadi",
    "eğitimadi",
    "kursadi",
    "kursadı",
    "kategoriadi",
    "kategoriadı",
    "duyuruadi",
    "duyuruadı",
    "haberadi",
    "haberadı",
    "{{",
    "}}",
    "${",
    "function",
    "javascript",
    "undefined",
    "null",
  ];

  if (malformedTemplateSignals.some((signal) => lowered.includes(signal))) {
    return true;
  }

  if (
    cleanTitle.includes('" +') ||
    cleanTitle.includes('+ "') ||
    cleanTitle.includes("' +") ||
    cleanTitle.includes("+ '") ||
    cleanTitle.includes("` +") ||
    cleanTitle.includes("+ `")
  ) {
    return true;
  }

  const letterCount = (cleanTitle.match(/[A-Za-zÇĞİÖŞÜçğıöşü]/g) || []).length;

  if (letterCount < 8) return true;
  if (ignoredExactTitles.includes(lowered)) return true;

  const words = lowered.split(" ").filter(Boolean);

  if (words.length < 2) return true;
  if (words.length <= 3 && new Set(words).size === 1) return true;

  if (noiseTitlePatterns.some((pattern) => lowered.includes(pattern))) {
    return true;
  }

  return false;
}

function normalizeUrl(value: string, fallbackUrl: string) {
  if (!value) return "";

  if (
    value.startsWith("#") ||
    value.startsWith("javascript:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return "";
  }

  try {
    return new URL(value, fallbackUrl).toString();
  } catch {
    return "";
  }
}

function isValidOpportunityCandidate(params: {
  title: string;
  url: string;
  sourceName: string;
}) {
  const candidateText = `${params.title} ${params.url}`;
  const titleLowered = params.title.toLocaleLowerCase("tr-TR");

  const jobSignal = hasAnyKeyword(candidateText, jobKeywords);
  const competitionSignal =
    isCompetitionSource(params.sourceName) &&
    hasAnyKeyword(candidateText, competitionKeywords);

  if (isMunicipalitySource(params.sourceName)) {
    const municipalityJobSignal = hasAnyKeyword(candidateText, [
      "personel alımı",
      "personel alim",
      "personel alım",
      "personel alınacaktır",
      "sözleşmeli personel",
      "sürekli işçi",
      "işçi alımı",
      "memur alımı",
      "eleman alımı",
      "istihdam edilecektir",
      "istihdam edilmek üzere",
    ]);

    return municipalityJobSignal;
  }

  if (titleLowered.includes("başvuru") && !jobSignal && !competitionSignal) {
    return false;
  }

  return jobSignal || competitionSignal;
}

function extractLinksFromHtml(html: string, baseUrl: string, sourceName: string) {
  const links: ExtractedLink[] = [];
  const seenUrls = new Set<string>();

  const anchorRegex =
    /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const innerHtml = match[2];

    const title = stripHtml(innerHtml);
    const url = normalizeUrl(href, baseUrl);

    if (!url || seenUrls.has(url)) continue;
    if (isIgnoredTitle(title)) continue;

    if (!isValidOpportunityCandidate({ title, url, sourceName })) continue;

    const matchedKeywords = getMatchedKeywords(`${title} ${url}`);

    if (matchedKeywords.length === 0) continue;

    seenUrls.add(url);

    links.push({
      title,
      url,
      matchedKeywords,
    });

    if (links.length >= 8) break;
  }

  return links;
}

function inferOpportunityType(text: string, sourceName: string) {
  const lowered = `${text} ${sourceName}`.toLocaleLowerCase("tr-TR");

  if (
    lowered.includes("yarışma") ||
    lowered.includes("yarisma") ||
    lowered.includes("teknofest") ||
    lowered.includes("tübitak") ||
    lowered.includes("tubitak") ||
    lowered.includes("2204") ||
    lowered.includes("2209") ||
    lowered.includes("proje çağrısı") ||
    lowered.includes("proje cagrisi")
  ) {
    return "Yarışma";
  }

  if (
    lowered.includes("akademik") ||
    lowered.includes("öğretim görevlisi") ||
    lowered.includes("ogretim gorevlisi") ||
    lowered.includes("araştırma görevlisi") ||
    lowered.includes("arastirma gorevlisi")
  ) {
    return "Akademik ilan";
  }

  if (lowered.includes("sözleşmeli") || lowered.includes("sozlesmeli")) {
    return "Sözleşmeli personel";
  }

  if (
    lowered.includes("sürekli işçi") ||
    lowered.includes("surekli isci") ||
    lowered.includes("işçi alımı") ||
    lowered.includes("isci alimi")
  ) {
    return "Sürekli işçi alımı";
  }

  if (
    lowered.includes("personel") ||
    lowered.includes("memur") ||
    lowered.includes("eleman alımı") ||
    lowered.includes("eleman alimi")
  ) {
    return "Kamu alımı";
  }

  return "Diğer";
}

function inferProfessionArea(text: string, fallback: string | null) {
  const lowered = text.toLocaleLowerCase("tr-TR");

  const directMatch = professionAreas.find((profession) =>
    lowered.includes(profession.toLocaleLowerCase("tr-TR"))
  );

  if (directMatch) return directMatch;

  const rules: Array<{ area: string; keywords: string[] }> = [
    {
      area: "Şehir ve Bölge Planlama",
      keywords: ["şehir plancısı", "şehir planlama", "bölge planlama", "imar", "planlama"],
    },
    {
      area: "CBS / GIS",
      keywords: ["cbs", "gis", "coğrafi bilgi", "mekansal veri", "mekânsal veri"],
    },
    {
      area: "Mimarlık",
      keywords: ["mimar", "mimarlık"],
    },
    {
      area: "Peyzaj Mimarlığı",
      keywords: ["peyzaj"],
    },
    {
      area: "Harita Mühendisliği",
      keywords: ["harita", "geomatik", "kadastro"],
    },
    {
      area: "Yazılım / Bilişim",
      keywords: ["yazılım", "bilişim", "programcı", "developer", "web", "mobil uygulama"],
    },
    {
      area: "Veri Analizi",
      keywords: ["veri", "data", "analist", "raporlama"],
    },
    {
      area: "Öğretmenlik",
      keywords: ["öğretmen", "öğretmenlik"],
    },
    {
      area: "Hukuk",
      keywords: ["avukat", "hukuk", "hukukçu"],
    },
    {
      area: "İş Sağlığı ve Güvenliği",
      keywords: ["iş güvenliği", "isg"],
    },
    {
      area: "Muhasebe",
      keywords: ["muhasebe", "mali müşavir"],
    },
    {
      area: "İnsan Kaynakları",
      keywords: ["insan kaynakları", "ik uzmanı"],
    },
    {
      area: "Hemşirelik",
      keywords: ["hemşire"],
    },
    {
      area: "Tıp",
      keywords: ["doktor", "hekim", "tabip"],
    },
    {
      area: "Tekniker / Teknisyen",
      keywords: ["tekniker", "teknisyen"],
    },
  ];

  const matchedRule = rules.find((rule) =>
    rule.keywords.some((keyword) => lowered.includes(keyword))
  );

  if (matchedRule) return matchedRule.area;

  return fallback || "Diğer";
}

function inferCity(text: string, fallback: string | null) {
  const lowered = text.toLocaleLowerCase("tr-TR");

  if (lowered.includes("uzaktan") || lowered.includes("remote")) {
    return "Uzaktan";
  }

  if (lowered.includes("türkiye geneli")) {
    return "Türkiye Geneli";
  }

  const matchedCity = cities.find((city) =>
    lowered.includes(city.toLocaleLowerCase("tr-TR"))
  );

  if (matchedCity) return matchedCity;

  return fallback || "Türkiye Geneli";
}

function extractDeadline(text: string) {
  const dateMatch = text.match(
    /(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/
  );

  if (!dateMatch) return null;

  const day = dateMatch[1].padStart(2, "0");
  const month = dateMatch[2].padStart(2, "0");
  const year = dateMatch[3];

  const normalized = `${year}-${month}-${day}`;
  const date = new Date(`${normalized}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) return null;

  return normalized;
}

function buildDescription(params: {
  title: string;
  sourceName: string;
  opportunityType: string;
}) {
  return `${params.title} başlıklı kayıt, ${params.sourceName} kaynağında iş ilanı / kamu alımı / yarışma odaklı taramayla aday fırsat olarak yakalanmıştır. Fırsat türü otomatik olarak "${params.opportunityType}" şeklinde sınıflandırılmıştır. Yayına almadan önce kaynak bağlantısı üzerinden detaylar kontrol edilmelidir.`;
}

function buildConfidence(keywordCount: number) {
  const value = 0.55 + Math.min(keywordCount, 5) * 0.08;

  return Number(Math.min(value, 0.9).toFixed(2));
}

async function fetchSourceHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "KariyerAtlasBot/1.0 (+https://kariyeratlas.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        html: "",
        text: "",
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    return {
      ok: true,
      status: response.status,
      html: html.slice(0, 250000),
      text: htmlToText(html).slice(0, 6000),
      error: null,
    };
  } catch (error) {
    clearTimeout(timeout);

    return {
      ok: false,
      status: null,
      html: "",
      text: "",
      error: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
}

function getSourceLimit() {
  const rawLimit = Number(process.env.SOURCE_CHECK_LIMIT || 8);

  if (!Number.isFinite(rawLimit)) return 8;

  return Math.max(1, Math.min(rawLimit, 15));
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${cronSecret}`) {
      return unauthorized();
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: run, error: runCreateError } = await supabase
    .from("ai_opportunity_runs")
    .insert({
      status: "running",
    })
    .select("id")
    .single();

  if (runCreateError || !run) {
    return NextResponse.json(
      {
        ok: false,
        error: runCreateError?.message || "Run could not be created.",
      },
      { status: 500 }
    );
  }

  const runId = run.id as string;
  const sourceLimit = getSourceLimit();

  const { data: sources, error: sourcesError } = await supabase
    .from("opportunity_sources")
    .select("id,name,source_url,profession_area,city")
    .eq("is_active", true)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: false })
    .limit(sourceLimit);

  if (sourcesError) {
    await supabase
      .from("ai_opportunity_runs")
      .update({
        status: "failed",
        error_message: sourcesError.message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return NextResponse.json(
      {
        ok: false,
        runId,
        error: sourcesError.message,
      },
      { status: 500 }
    );
  }

  const activeSources = (sources || []) as OpportunitySource[];

  let successCount = 0;
  let errorCount = 0;
  let candidatesFoundCount = 0;
  let candidatesInsertedCount = 0;
  let duplicatesSkippedCount = 0;

  const sourceResults: Array<{
    name: string;
    ok: boolean;
    linksFound: number;
    candidatesInserted: number;
    error: string | null;
  }> = [];

  for (const source of activeSources) {
    const checkedAt = new Date().toISOString();

    try {
      const page = await fetchSourceHtml(source.source_url);

      if (!page.ok) {
        errorCount += 1;

        await supabase
          .from("opportunity_sources")
          .update({
            last_checked_at: checkedAt,
            last_error: page.error || "Source check failed.",
            updated_at: checkedAt,
          })
          .eq("id", source.id);

        sourceResults.push({
          name: source.name,
          ok: false,
          linksFound: 0,
          candidatesInserted: 0,
          error: page.error || "Source check failed.",
        });

        continue;
      }

      successCount += 1;

      await supabase
        .from("opportunity_sources")
        .update({
          last_checked_at: checkedAt,
          last_success_at: checkedAt,
          last_error: null,
          updated_at: checkedAt,
        })
        .eq("id", source.id);

      const extractedLinks = extractLinksFromHtml(
        page.html,
        source.source_url,
        source.name
      );

      candidatesFoundCount += extractedLinks.length;

      let insertedForSource = 0;

      for (const link of extractedLinks) {
        const { data: existingCandidate } = await supabase
          .from("opportunity_candidates")
          .select("id")
          .eq("source_url", link.url)
          .limit(1)
          .maybeSingle();

        const { data: existingPublished } = await supabase
          .from("opportunities")
          .select("id")
          .eq("source_url", link.url)
          .limit(1)
          .maybeSingle();

        if (existingCandidate || existingPublished) {
          duplicatesSkippedCount += 1;
          continue;
        }

        const contextText = `${link.title} ${source.name} ${page.text.slice(0, 500)}`;
        const opportunityType = inferOpportunityType(contextText, source.name);
        const professionArea = inferProfessionArea(contextText, source.profession_area);
        const city = inferCity(contextText, source.city);
        const deadline = extractDeadline(contextText);
        const confidence = buildConfidence(link.matchedKeywords.length);

        const { error: insertError } = await supabase
          .from("opportunity_candidates")
          .insert({
            source_id: source.id,
            title: link.title.slice(0, 250),
            organization: source.name,
            opportunity_type: opportunityType,
            profession_area: professionArea,
            city,
            description: buildDescription({
              title: link.title,
              sourceName: source.name,
              opportunityType,
            }),
            source_url: link.url,
            deadline,
            ai_summary: "Ücretsiz iş ilanı / yarışma odaklı taramayla yakalandı.",
            ai_reason: `Eşleşen kelimeler: ${link.matchedKeywords.join(", ")}`,
            ai_confidence: confidence,
            raw_text: contextText.slice(0, 5000),
            review_status: "pending",
          });

        if (!insertError) {
          insertedForSource += 1;
          candidatesInsertedCount += 1;
        }
      }

      sourceResults.push({
        name: source.name,
        ok: true,
        linksFound: extractedLinks.length,
        candidatesInserted: insertedForSource,
        error: null,
      });
    } catch (error) {
      errorCount += 1;

      const message = error instanceof Error ? error.message : "Unknown error";

      await supabase
        .from("opportunity_sources")
        .update({
          last_checked_at: checkedAt,
          last_error: message,
          updated_at: checkedAt,
        })
        .eq("id", source.id);

      sourceResults.push({
        name: source.name,
        ok: false,
        linksFound: 0,
        candidatesInserted: 0,
        error: message,
      });
    }
  }

  await supabase
    .from("ai_opportunity_runs")
    .update({
      status: "completed",
      checked_sources_count: activeSources.length,
      candidates_found_count: candidatesFoundCount,
      candidates_inserted_count: candidatesInsertedCount,
      duplicates_skipped_count: duplicatesSkippedCount,
      error_message:
        errorCount > 0
          ? `${errorCount} source check failed.`
          : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);

  return NextResponse.json({
    ok: true,
    mode: "free_job_competition_scan",
    runId,
    checkedSources: activeSources.length,
    successfulSources: successCount,
    failedSources: errorCount,
    candidatesFound: candidatesFoundCount,
    candidatesInserted: candidatesInsertedCount,
    duplicatesSkipped: duplicatesSkippedCount,
    sourceResults,
  });
}
