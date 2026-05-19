import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body: Partial<User> = await request.json();

    const { data, error } = await supabase
      .from("users")
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
