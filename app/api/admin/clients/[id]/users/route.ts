import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params;

  try {
    const body = await request.json();
    const { line_user_id, role } = body as { line_user_id: string; role: string };

    if (!line_user_id?.trim()) {
      return NextResponse.json({ error: "line_user_id は必須です" }, { status: 400 });
    }

    const { data: userRows, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("line_user_id", line_user_id.trim())
      .limit(1);

    if (userError) {
      return NextResponse.json({ error: `ユーザー検索エラー: ${userError.message}` }, { status: 500 });
    }

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "指定されたLINE User IDのユーザーが見つかりません" }, { status: 404 });
    }

    const userId = userRows[0].id;

    const { data, error } = await supabase
      .from("client_users")
      .insert({ user_id: userId, client_id: clientId, role: role ?? "client_manager" })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `追加エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
