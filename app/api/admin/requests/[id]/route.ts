import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, delivery_url } = body as {
      status: string;
      delivery_url?: string;
    };

    if (!status) {
      return NextResponse.json({ error: "status は必須です" }, { status: 400 });
    }

    // 現在のリクエストを取得（delivered 二重記録防止のため）
    const { data: current, error: fetchError } = await supabase
      .from("asset_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "リクエストが見つかりません" }, { status: 404 });
    }

    // status と delivery_url を更新
    const updatePayload: { status: string; delivery_url?: string | null } = { status };
    if (delivery_url !== undefined) updatePayload.delivery_url = delivery_url || null;

    const { data: updated, error: updateError } = await supabase
      .from("asset_requests")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `更新エラー: ${updateError.message}` },
        { status: 500 }
      );
    }

    // delivered になった場合のみ credit_transactions を記録（二重防止）
    if (status === "delivered" && current.status !== "delivered") {
      const { error: txError } = await supabase
        .from("credit_transactions")
        .insert({
          client_id: current.client_id,
          amount: -Math.abs(current.total_credit),
          description: `素材納品 (Request: ${id})`,
          transaction_type: "asset_usage",
        });

      if (txError) {
        return NextResponse.json(
          { error: `クレジット記録エラー: ${txError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "予期せぬエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
