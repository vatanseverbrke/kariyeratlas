import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_delete=server_error", request.url),
      { status: 303 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await supabase
    .from("opportunity_sources")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(
      new URL("/admin/kaynaklar?source_delete=error", request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(
    new URL("/admin/kaynaklar?source_delete=success", request.url),
    { status: 303 }
  );
}
