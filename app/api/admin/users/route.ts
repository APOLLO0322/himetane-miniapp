import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { line_user_id, line_display_name, role, client_id } = body as {
      line_user_id: string;
      line_display_name: string;
      role: Role;
      client_id?: string;
    };

    if (!line_user_id?.trim() || !line_display_name?.trim()) {
      return NextResponse.json({ error: "line_user_id と line_display_name は必須です" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ line_user_id: line_user_id.trim(), line_display_name: line_display_name.trim(), role, picture_url: null })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: `ユーザー作成エラー: ${userError?.message}` }, { status: 500 });
    }

    if ((role === "client_owner" || role === "client_manager") && client_id) {
      const { error: cuError } = await supabase
        .from("client_users")
        .insert({ user_id: user.id, client_id, role });

      if (cuError) {
        console.error("client_users 登録エラー:", cuError.message);
      }
    }

    return NextResponse.json({ data: user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
