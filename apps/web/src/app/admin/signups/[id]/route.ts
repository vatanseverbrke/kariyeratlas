import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedStatuses = ["new", "contacted", "waiting", "archived"];

function redirectToAdmin(request: Request, status: string) {
  const url = new URL(request.url);
  url.pathname = "/admin";
  url.search = `?status_update=${status}`;
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
    return redirectToAdmin(request, "config_error");
  }

  const formData = await request.formData();
  const status = String(formData.get("status") || "").trim();

  if (!allowedStatuses.includes(status)) {
    return redirectToAdmin(request, "invalid_status");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await supabase
    .from("early_access_signups")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Status update error:", error);
    return redirectToAdmin(request, "error");
  }

  return redirectToAdmin(request, "success");
}