import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { line_user_id, line_display_name, picture_url } = await request.json();

    if (!line_user_id) {
      return NextResponse.json({ error: "line_user_id is required" }, { status: 400 });
    }

    // 既存ユーザーを確認
    const { data: existing } = await supabase
      .from("users")
      .select("id, role")
      .eq("line_user_id", line_user_id)
      .single();

    if (existing) {
      // 表示名・アイコンだけ更新
      await supabase
        .from("users")
        .update({ line_display_name, picture_url })
        .eq("line_user_id", line_user_id);

      return NextResponse.json({ user_id: existing.id, role: existing.role, created: false });
    }

    // 新規ユーザーを作成（デフォルトrole: client_owner）
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        line_user_id,
        line_display_name: line_display_name ?? null,
        picture_url: picture_url ?? null,
        role: "client_owner",
      })
      .select("id, role")
      .single();

    if (error || !newUser) {
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }

    return NextResponse.json({ user_id: newUser.id, role: newUser.role, created: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
