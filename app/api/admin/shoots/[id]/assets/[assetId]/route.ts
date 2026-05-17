import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await request.json();
    const { status } = body as { status: string };

    if (!status) {
      return NextResponse.json({ error: "status は必須です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("assets")
      .update({ status })
      .eq("id", assetId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `更新エラー: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, asset: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
