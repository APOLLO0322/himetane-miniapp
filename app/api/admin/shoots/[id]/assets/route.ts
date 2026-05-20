import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shootId } = await params;
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const file_type = (formData.get("file_type") as string | null) ?? "photo";
    const credit_cost = Number(formData.get("credit_cost") ?? 1);

    if (!title) {
      return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
    }

    // Fetch shoot to get client_id
    const { data: shoot, error: shootError } = await supabase
      .from("shoots")
      .select("id, client_id")
      .eq("id", shootId)
      .single();

    if (shootError || !shoot) {
      return NextResponse.json({ error: "撮影が見つかりません" }, { status: 404 });
    }

    // Generate asset_no
    const { count } = await supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("shoot_id", shootId);

    const nextNo = (count ?? 0) + 1;
    const asset_no = String(nextNo).padStart(3, "0");

    // Upload file to Vercel Blob (if file provided)
    let preview_url: string | null = null;
    let blob_path: string | null = null;

    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() ?? "bin";
      const blobPath = `clients/${shoot.client_id}/shoots/${shootId}/candidates/${asset_no}.${ext}`;

      const blob = await put(blobPath, file, {
        access: "public",
        contentType: file.type || undefined,
      });

      preview_url = blob.url;
      blob_path = blobPath;
    }

    const { data, error } = await supabase
      .from("assets")
      .insert({
        client_id: shoot.client_id,
        shoot_id: shootId,
        asset_no,
        title,
        file_type,
        credit_cost,
        status: "draft",
        preview_url,
        original_url: preview_url,
        thumbnail_url: null,
        file_url: preview_url,
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
