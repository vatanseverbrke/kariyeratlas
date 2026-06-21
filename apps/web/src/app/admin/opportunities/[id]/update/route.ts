import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedStatuses = ["active", "draft", "archived"];

function redirectToAdminOpportunities(request: Request, status: string) {
  const url = new URL(request.url);
  url.pathname = "/admin/firsatlar";
  url.search = `?opportunity_update=${status}`;
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

  const status = String(formData.get("status") || "").trim();
  const isFeatured = formData.get("is_featured") === "on";

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
      status,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Opportunity update error:", error);
    return redirectToAdminOpportunities(request, "error");
  }

  return redirectToAdminOpportunities(request, "success");
}