import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function redirectToAdminOpportunities(request: Request, status: string) {
  const url = new URL(request.url);
  url.pathname = "/admin/firsatlar";
  url.search = `?opportunity_delete=${status}`;
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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Opportunity delete error:", error);
    return redirectToAdminOpportunities(request, "error");
  }

  return redirectToAdminOpportunities(request, "success");
}