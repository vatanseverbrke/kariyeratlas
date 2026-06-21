import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedStatuses = ["active", "draft", "archived"];

function redirectToAdminOpportunities(request: Request, status: string) {
  const url = new URL(request.url);
  url.pathname = "/admin/firsatlar";
  url.search = `?opportunity_edit=${status}`;
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return redirectToAdminOpportunities(request, "config_error");
  }

  const formData = await request.formData();

  const title = String(formData.get("title") || "").trim();
  const organization = String(formData.get("organization") || "").trim();
  const opportunityType = String(formData.get("opportunity_type") || "").trim();
  const professionArea =
    String(formData.get("profession_area") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const sourceUrl = String(formData.get("source_url") || "").trim();
  const deadline = String(formData.get("deadline") || "").trim() || null;
  const status = String(formData.get("status") || "active").trim();
  const isFeatured = formData.get("is_featured") === "on";

  if (!title || !organization || !opportunityType || !sourceUrl) {
    return redirectToAdminOpportunities(request, "missing_fields");
  }

  if (!allowedStatuses.includes(status)) {
    return redirectToAdminOpportunities(request, "invalid_status");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await supabase
    .from("opportunities")
    .update({
      title,
      organization,
      opportunity_type: opportunityType,
      profession_area: professionArea,
      city,
      description,
      source_url: sourceUrl,
      deadline,
      status,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Opportunity edit error:", error);
    return redirectToAdminOpportunities(request, "error");
  }

  return redirectToAdminOpportunities(request, "success");
}
