import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizeOptional(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();

  return text.length > 0 ? text : null;
}

function normalizeUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = String(formData.get("name") || "").trim();
  const rawUrl = String(formData.get("source_url") || "").trim();
  const sourceUrl = normalizeUrl(rawUrl);
  const sourceType = String(formData.get("source_type") || "web_page").trim();

  if (!name || !rawUrl) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_create=missing_fields", request.url),
      { status: 303 }
    );
  }

  if (!sourceUrl) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_create=invalid_url", request.url),
      { status: 303 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_create=server_error", request.url),
      { status: 303 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const now = new Date().toISOString();

  const { error } = await supabase.from("opportunity_sources").insert({
    name,
    source_url: sourceUrl,
    source_type: sourceType || "web_page",
    profession_area: normalizeOptional(formData.get("profession_area")),
    city: normalizeOptional(formData.get("city")),
    is_active: true,
    updated_at: now,
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_create=error", request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL("/admin/kaynaklar?source_create=success", request.url),
    { status: 303 }
  );
}
