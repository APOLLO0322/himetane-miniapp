import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("clients")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `更新エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
