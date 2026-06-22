import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const formData = await request.formData();

  const status = String(formData.get("status") || "active");
  const isFeatured = formData.get("is_featured") === "on";

  const allowedStatuses = ["active", "draft"];

  if (!allowedStatuses.includes(status)) {
    return NextResponse.redirect(
      new URL("/admin/aday-firsatlar?candidate_approve=invalid_status", request.url),
      { status: 303 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL("/admin/aday-firsatlar?candidate_approve=server_error", request.url),
      { status: 303 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data: candidate, error: candidateError } = await supabase
    .from("opportunity_candidates")
    .select(
      "id,title,organization,opportunity_type,profession_area,city,description,source_url,deadline"
    )
    .eq("id", id)
    .single();

  if (candidateError || !candidate) {
    return NextResponse.redirect(
      new URL("/admin/aday-firsatlar?candidate_approve=not_found", request.url),
      { status: 303 }
    );
  }

  const selectedCandidate = candidate as Candidate;

  const { data: existingPublished } = await supabase
    .from("opportunities")
    .select("id")
    .eq("source_url", selectedCandidate.source_url)
    .maybeSingle();

  if (existingPublished) {
    await supabase
      .from("opportunity_candidates")
      .update({
        review_status: "duplicate",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.redirect(
      new URL("/admin/aday-firsatlar?candidate_approve=duplicate", request.url),
      { status: 303 }
    );
  }

  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from("opportunities").insert({
    title: selectedCandidate.title,
    organization: selectedCandidate.organization || "Belirtilmemiş kurum",
    opportunity_type: selectedCandidate.opportunity_type || "Diğer",
    profession_area: selectedCandidate.profession_area,
    city: selectedCandidate.city,
    description: selectedCandidate.description,
    source_url: selectedCandidate.source_url,
    deadline: selectedCandidate.deadline,
    status,
    is_featured: isFeatured,
    updated_at: now,
  });

  if (insertError) {
    return NextResponse.redirect(
      new URL("/admin/aday-firsatlar?candidate_approve=error", request.url),
      { status: 303 }
    );
  }

  await supabase
    .from("opportunity_candidates")
    .update({
      review_status: "approved",
      reviewed_at: now,
      approved_at: now,
    })
    .eq("id", id);

  return NextResponse.redirect(
    new URL("/admin/aday-firsatlar?candidate_approve=success", request.url),
    { status: 303 }
  );
}
