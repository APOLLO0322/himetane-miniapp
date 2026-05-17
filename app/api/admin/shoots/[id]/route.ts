import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, status, memo } = body as {
      title?: string;
      status?: string;
      memo?: string | null;
    };

    const updatePayload: Partial<{ title: string; status: string; memo: string | null }> = {};
    if (title !== undefined) updatePayload.title = title;
    if (status !== undefined) updatePayload.status = status;
    if (memo !== undefined) updatePayload.memo = memo;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "更新するフィールドがありません" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("shoots")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `更新エラー: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, shoot: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
