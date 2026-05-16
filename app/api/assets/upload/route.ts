import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN が設定されていません。.env.local を確認してください。" },
        { status: 500 }
      );
    }

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const clientId = formData.get("client_id") as string | null;
    const shootId = (formData.get("shoot_id") as string | null) || null;
    const assetNo = formData.get("asset_no") as string | null;
    const title = formData.get("title") as string | null;
    const fileType = formData.get("file_type") as string | null;
    const creditCost = parseInt(formData.get("credit_cost") as string) || 1;
    const status = (formData.get("status") as string) || "draft";

    // バリデーション
    if (!file || !clientId || !assetNo || !title || !fileType) {
      return NextResponse.json(
        { error: "必須項目が不足しています（ファイル・顧客・素材番号・タイトル・種別）" },
        { status: 400 }
      );
    }

    // Vercel Blob にアップロード
    const blobPath = `assets/${clientId}/${assetNo}-${Date.now()}-${file.name}`;
    const blob = await put(blobPath, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Supabase assets テーブルに登録
    const { data, error } = await supabase
      .from("assets")
      .insert({
        client_id: clientId,
        shoot_id: shootId || null,
        asset_no: assetNo,
        title,
        file_type: fileType,
        credit_cost: creditCost,
        status,
        preview_url: blob.url,
        original_url: blob.url,
        thumbnail_url: null,
        file_url: blob.url,
        tags: null,
        month: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Supabase 登録エラー: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, asset: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
