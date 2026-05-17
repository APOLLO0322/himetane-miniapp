import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const body = await request.json();
    const { delivery_url, delivery_title, file_type, shoot_id, client_id } = body as {
      delivery_url: string;
      delivery_title?: string | null;
      file_type?: string;
      shoot_id?: string | null;
      client_id: string;
    };

    if (!delivery_url || !client_id) {
      return NextResponse.json({ error: "delivery_url と client_id は必須です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("deliveries")
      .insert({
        request_id: requestId,
        client_id,
        shoot_id: shoot_id ?? null,
        delivery_title: delivery_title ?? null,
        delivery_url,
        blob_path: null,
        file_type: file_type ?? "other",
        status: "draft",
        delivered_at: null,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: `作成エラー: ${error?.message}` }, { status: 500 });
    }

    return NextResponse.json({ delivery_id: data.id, delivery: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
