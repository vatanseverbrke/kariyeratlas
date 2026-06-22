import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cities, opportunityTypes, professionAreas } from "@/lib/options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpportunitySource = {
  id: string;
  name: string;
  source_url: string;
  profession_area: string | null;
  city: string | null;
};

type ExtractedCandidate = {
  title: string;
  organization: string | null;
  opportunity_type: string | null;
  profession_area: string | null;
  city: string | null;
  description: string | null;
  source_url: string | null;
  deadline: string | null;
  ai_summary: string | null;
  ai_reason: string | null;
  ai_confidence: number;
};

type AiExtractionResult = {
  candidates: ExtractedCandidate[];
};

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(value: string | null) {
  if (!value) return null;

  const trimmed = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const date = new Date(`${trimmed}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return trimmed;
}

function normalizeConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;

  if (value < 0) return 0;
  if (value > 1) return 1;

  return Number(value.toFixed(2));
}

function normalizeUrl(value: string | null, fallbackUrl: string) {
  if (!value) return fallbackUrl;

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(value, fallbackUrl).toString();
    } catch {
      return fallbackUrl;
    }
  }
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        type?: string;
        text?: string;
      }>;
    }>;
  };

  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  const parts: string[] = [];

  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

async function fetchSourceText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

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
        text: "",
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const text = htmlToText(html).slice(0, 18000);

    return {
      ok: true,
      status: response.status,
      text,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeout);

    return {
      ok: false,
      status: null,
      text: "",
      error: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
}

async function extractOpportunitiesWithAi(params: {
  source: OpportunitySource;
  pageText: string;
  openAiApiKey: string;
}) {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "Sen KariyerAtlas için çalışan bir fırsat çıkarım asistanısın. Sadece gerçek kariyer fırsatlarını çıkar: iş ilanı, kamu alımı, belediye ilanı, staj, eğitim, yarışma, burs, meslek odası duyurusu, gönüllülük, uzaktan çalışma veya proje bazlı iş. Genel haberleri, siyasi duyuruları, etkinlik olmayan haberleri ve belirsiz metinleri fırsat olarak çıkarma. Emin değilsen candidates dizisini boş döndür.",
        },
        {
          role: "user",
          content: [
            `Kaynak adı: ${params.source.name}`,
            `Kaynak URL: ${params.source.source_url}`,
            `Varsayılan meslek alanı: ${params.source.profession_area || "Belirsiz"}`,
            `Varsayılan şehir: ${params.source.city || "Belirsiz"}`,
            "",
            `Geçerli fırsat türleri: ${opportunityTypes.join(", ")}`,
            `Geçerli meslek alanları: ${professionAreas.join(", ")}`,
            `Geçerli şehirler: ${cities.join(", ")}`,
            "",
            "Aşağıdaki sayfa metninden en fazla 5 adet güncel ve anlamlı kariyer fırsatı çıkar.",
            "deadline alanını yalnızca kesin tarih varsa YYYY-MM-DD formatında ver; yoksa null ver.",
            "opportunity_type, profession_area ve city alanlarını mümkünse verilen listelerden seç.",
            "source_url alanı fırsatın detay linki değilse kaynak URL olarak kalabilir.",
            "",
            "SAYFA METNİ:",
            params.pageText,
          ].join("\n"),
        },
      ],
      max_output_tokens: 1600,
      text: {
        format: {
          type: "json_schema",
          name: "kariyeratlas_opportunity_extraction",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              candidates: {
                type: "array",
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: {
                      type: "string",
                      description: "Fırsat başlığı.",
                    },
                    organization: {
                      type: ["string", "null"],
                      description: "Kurum, belediye, firma veya organizasyon adı.",
                    },
                    opportunity_type: {
                      type: ["string", "null"],
                      description: "Fırsat türü.",
                    },
                    profession_area: {
                      type: ["string", "null"],
                      description: "Meslek veya uzmanlık alanı.",
                    },
                    city: {
                      type: ["string", "null"],
                      description: "Şehir, Türkiye Geneli veya Uzaktan.",
                    },
                    description: {
                      type: ["string", "null"],
                      description: "Kısa ve sade açıklama.",
                    },
                    source_url: {
                      type: ["string", "null"],
                      description: "Detay URL'si veya kaynak URL.",
                    },
                    deadline: {
                      type: ["string", "null"],
                      description: "YYYY-MM-DD formatında son başvuru tarihi veya null.",
                    },
                    ai_summary: {
                      type: ["string", "null"],
                      description: "Kısa özet.",
                    },
                    ai_reason: {
                      type: ["string", "null"],
                      description: "Neden fırsat olarak değerlendirildiği.",
                    },
                    ai_confidence: {
                      type: "number",
                      description: "0 ile 1 arasında güven skoru.",
                    },
                  },
                  required: [
                    "title",
                    "organization",
                    "opportunity_type",
                    "profession_area",
                    "city",
                    "description",
                    "source_url",
                    "deadline",
                    "ai_summary",
                    "ai_reason",
                    "ai_confidence",
                  ],
                },
              },
            },
            required: ["candidates"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`OpenAI API error ${response.status}: ${errorText.slice(0, 500)}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);

  if (!outputText) {
    return {
      candidates: [],
    } satisfies AiExtractionResult;
  }

  return JSON.parse(outputText) as AiExtractionResult;
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
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase environment variables are missing.",
      },
      { status: 500 }
    );
  }

  if (!openAiApiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPENAI_API_KEY is missing.",
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

  const { data: sources, error: sourcesError } = await supabase
    .from("opportunity_sources")
    .select("id,name,source_url,profession_area,city")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(5);

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
    candidatesFound: number;
    candidatesInserted: number;
    error: string | null;
  }> = [];

  for (const source of activeSources) {
    const checkedAt = new Date().toISOString();

    try {
      const page = await fetchSourceText(source.source_url);

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
          candidatesFound: 0,
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

      if (page.text.length < 300) {
        sourceResults.push({
          name: source.name,
          ok: true,
          candidatesFound: 0,
          candidatesInserted: 0,
          error: "Page text was too short for AI extraction.",
        });

        continue;
      }

      const extraction = await extractOpportunitiesWithAi({
        source,
        pageText: page.text,
        openAiApiKey,
      });

      const candidates = extraction.candidates || [];
      candidatesFoundCount += candidates.length;

      let insertedForSource = 0;

      for (const candidate of candidates) {
        const sourceUrl = normalizeUrl(candidate.source_url, source.source_url);

        const { data: existingCandidate } = await supabase
          .from("opportunity_candidates")
          .select("id")
          .eq("source_url", sourceUrl)
          .maybeSingle();

        const { data: existingPublished } = await supabase
          .from("opportunities")
          .select("id")
          .eq("source_url", sourceUrl)
          .maybeSingle();

        if (existingCandidate || existingPublished) {
          duplicatesSkippedCount += 1;
          continue;
        }

        const confidence = normalizeConfidence(candidate.ai_confidence);

        const { error: insertError } = await supabase
          .from("opportunity_candidates")
          .insert({
            source_id: source.id,
            title: candidate.title.slice(0, 250),
            organization: candidate.organization || source.name,
            opportunity_type: candidate.opportunity_type || "Diğer",
            profession_area: candidate.profession_area || source.profession_area,
            city: candidate.city || source.city,
            description: candidate.description,
            source_url: sourceUrl,
            deadline: normalizeDate(candidate.deadline),
            ai_summary: candidate.ai_summary,
            ai_reason: candidate.ai_reason,
            ai_confidence: confidence,
            raw_text: page.text.slice(0, 5000),
            review_status: "pending",
          });

        if (!insertError) {
          candidatesInsertedCount += 1;
          insertedForSource += 1;
        }
      }

      sourceResults.push({
        name: source.name,
        ok: true,
        candidatesFound: candidates.length,
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
        candidatesFound: 0,
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
          ? `${errorCount} source check or AI extraction failed.`
          : null,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);

  return NextResponse.json({
    ok: true,
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
