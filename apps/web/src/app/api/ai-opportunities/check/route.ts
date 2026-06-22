import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpportunitySource = {
  id: string;
  name: string;
  source_url: string;
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

async function checkSource(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "KariyerAtlasBot/1.0 (+https://kariyeratlas.com)",
      },
      cache: "no-store",
    });

    clearTimeout(timeout);

    return {
      ok: response.ok,
      status: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (error) {
    clearTimeout(timeout);

    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : "Unknown fetch error",
    };
  }
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

  const { data: sources, error: sourcesError } = await supabase
    .from("opportunity_sources")
    .select("id,name,source_url")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(10);

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

  for (const source of activeSources) {
    const checkedAt = new Date().toISOString();
    const result = await checkSource(source.source_url);

    if (result.ok) {
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
    } else {
      errorCount += 1;

      await supabase
        .from("opportunity_sources")
        .update({
          last_checked_at: checkedAt,
          last_error: result.error || "Source check failed.",
          updated_at: checkedAt,
        })
        .eq("id", source.id);
    }
  }

  await supabase
    .from("ai_opportunity_runs")
    .update({
      status: "completed",
      checked_sources_count: activeSources.length,
      candidates_found_count: 0,
      candidates_inserted_count: 0,
      duplicates_skipped_count: 0,
      error_message:
        errorCount > 0
          ? `${errorCount} source check failed.`
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
    candidatesFound: 0,
    candidatesInserted: 0,
    note: "Source check skeleton completed. AI extraction will be added in the next step.",
  });
}
