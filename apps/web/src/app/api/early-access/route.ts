import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function redirectTo(request: Request, status: string) {
  const url = new URL(request.url);
  url.pathname = "/";
  url.search = `?early_access=${status}`;
  url.hash = "erken-erisim";
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !serviceRoleKey) {
      return redirectTo(request, "config_error");
    }

    const formData = await request.formData();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const profession =
      String(formData.get("profession") || "").trim() || null;

    const city = String(formData.get("city") || "").trim() || null;

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !isValidEmail) {
      return redirectTo(request, "invalid_email");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { error } = await supabase.from("early_access_signups").upsert(
      {
        email,
        profession,
        city,
        source: "landing_page",
        status: "new",
      },
      {
        onConflict: "email",
      }
    );

    if (error) {
      console.error("Early access signup error:", error);
      return redirectTo(request, "error");
    }

    return redirectTo(request, "success");
  } catch (error) {
    console.error("Unexpected early access error:", error);
    return redirectTo(request, "error");
  }
}