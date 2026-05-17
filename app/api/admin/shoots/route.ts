import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, title, shoot_date, status, memo } = body as {
      client_id: string;
      title: string;
      shoot_date?: string | null;
      status?: string;
      memo?: string | null;
    };

    if (!client_id || !title) {
      return NextResponse.json({ error: "client_id と title は必須です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("shoots")
      .insert({
        client_id,
        title,
        shoot_date: shoot_date ?? null,
        status: status ?? "scheduled",
        memo: memo ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `作成エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ shoot_id: data.id, shoot: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
