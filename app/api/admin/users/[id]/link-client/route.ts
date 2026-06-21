import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: ユーザーを店舗に紐付け（client_usersにinsert or update）
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;

  try {
    const { client_id, role } = await request.json();

    if (!client_id || !role) {
      return NextResponse.json({ error: "client_id と role は必須です" }, { status: 400 });
    }

    // 既存の紐付けを確認
    const { data: existing } = await supabase
      .from("client_users")
      .select("id")
      .eq("user_id", userId)
      .eq("client_id", client_id)
      .single();

    if (existing) {
      // 既にあれば role だけ更新
      const { error } = await supabase
        .from("client_users")
        .update({ role })
        .eq("id", existing.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // 新規紐付け
      const { error } = await supabase
        .from("client_users")
        .insert({ user_id: userId, client_id, role });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // usersテーブルのroleも更新
    await supabase.from("users").update({ role }).eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: 店舗の紐付けを解除
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = await params;

  try {
    const { client_id } = await request.json();

    const { error } = await supabase
      .from("client_users")
      .delete()
      .eq("user_id", userId)
      .eq("client_id", client_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
