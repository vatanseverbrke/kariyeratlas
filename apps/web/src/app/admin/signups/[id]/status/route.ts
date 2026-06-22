import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const formData = await request.formData();
  const status = String(formData.get("status") || "new");

  const allowedStatuses = ["new", "contacted", "approved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    return NextResponse.redirect(
      new URL("/admin?signup_update=invalid_status", request.url),
      { status: 303 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL("/admin?signup_update=server_error", request.url),
      { status: 303 }
    );
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
    return NextResponse.redirect(
      new URL("/admin?signup_update=error", request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL("/admin?signup_update=success", request.url),
    { status: 303 }
  );
}
