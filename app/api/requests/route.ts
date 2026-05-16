import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_id, asset_ids, note } = body as {
      client_id: string;
      asset_ids: string[];
      note?: string;
    };

    if (!client_id || !Array.isArray(asset_ids) || asset_ids.length === 0) {
      return NextResponse.json(
        { error: "client_id と asset_ids は必須です" },
        { status: 400 }
      );
    }

    // 選択素材のクレジットコストを取得
    const { data: assetRows, error: assetError } = await supabase
      .from("assets")
      .select("id, credit_cost, file_type")
      .in("id", asset_ids);

    if (assetError) {
      return NextResponse.json(
        { error: `素材取得エラー: ${assetError.message}` },
        { status: 500 }
      );
    }

    const total_credit = (assetRows ?? []).reduce((sum, a) => {
      const cost = a.credit_cost ?? (a.file_type?.startsWith("video") ? 2 : 1);
      return sum + cost;
    }, 0);

    // asset_requests に INSERT
    const { data: reqRow, error: reqError } = await supabase
      .from("asset_requests")
      .insert({
        client_id,
        status: "pending",
        total_credit,
        note: note ?? null,
        delivery_url: null,
      })
      .select()
      .single();

    if (reqError || !reqRow) {
      return NextResponse.json(
        { error: `リクエスト作成エラー: ${reqError?.message}` },
        { status: 500 }
      );
    }

    // asset_request_items に一括 INSERT
    const items = asset_ids.map((asset_id) => ({
      asset_request_id: reqRow.id,
      asset_id,
    }));

    const { error: itemsError } = await supabase
      .from("asset_request_items")
      .insert(items);

    if (itemsError) {
      return NextResponse.json(
        { error: `アイテム登録エラー: ${itemsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request_id: reqRow.id, total_credit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
