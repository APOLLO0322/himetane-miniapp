import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shootId } = await params;
    const body = await request.json();
    const { title, file_type, credit_cost, preview_url } = body as {
      title: string;
      file_type: string;
      credit_cost?: number;
      preview_url?: string | null;
    };

    if (!title || !file_type) {
      return NextResponse.json({ error: "title と file_type は必須です" }, { status: 400 });
    }

    // Fetch the shoot to get client_id
    const { data: shoot, error: shootError } = await supabase
      .from("shoots")
      .select("id, client_id")
      .eq("id", shootId)
      .single();

    if (shootError || !shoot) {
      return NextResponse.json({ error: "撮影が見つかりません" }, { status: 404 });
    }

    // Count existing assets for this shoot to generate asset_no
    const { count } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("shoot_id", shootId);

    const nextNo = (count ?? 0) + 1;
    const asset_no = String(nextNo).padStart(3, "0");

    // blob_path placeholder (actual upload not yet implemented - BLOB_READ_WRITE_TOKEN is empty)
    const blob_path = `clients/${shoot.client_id}/shoots/${shootId}/candidates/${asset_no}-${title}`;

    const { data, error } = await supabase
      .from("assets")
      .insert({
        client_id: shoot.client_id,
        shoot_id: shootId,
        asset_no,
        title,
        file_type,
        credit_cost: credit_cost ?? 1,
        status: "draft",
        preview_url: preview_url ?? null,
        original_url: null,
        thumbnail_url: null,
        file_url: null,
        tags: null,
        month: null,
        blob_path,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `作成エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ asset_id: data.id, asset: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
