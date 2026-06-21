import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Signup = {
  email: string;
  profession: string | null;
  city: string | null;
  status: string;
  source: string;
  created_at: string;
};

function escapeCsv(value: string | null) {
  const rawValue = value ?? "";
  return `"${rawValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase bağlantı ayarları eksik." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from("early_access_signups")
    .select("email,profession,city,status,source,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Kayıtlar alınamadı.", details: error.message },
      { status: 500 }
    );
  }

  const signups = (data || []) as Signup[];

  const header = [
    "E-posta",
    "Meslek / Alan",
    "Şehir",
    "Durum",
    "Kaynak",
    "Kayıt Tarihi",
  ];

  const rows = signups.map((signup) => [
    signup.email,
    signup.profession,
    signup.city,
    signup.status,
    signup.source,
    signup.created_at,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");

  const fileName = `kariyeratlas-erken-erisim-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(`\uFEFF${csvContent}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}