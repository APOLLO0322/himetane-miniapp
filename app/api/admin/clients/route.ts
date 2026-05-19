import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, plan_status, memo, created_at")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, plan_status, memo } = body as {
      name: string;
      plan_status?: string;
      memo?: string | null;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "店舗名は必須です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({ name: name.trim(), plan_status: plan_status ?? "active", memo: memo ?? null, line_user_id: null, line_display_name: null })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `作成エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
