import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AssetRequest, AssetRequestItem, Asset, Client, Delivery } from "@/lib/types";
import RequestDetail from "./RequestDetail";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  text: "#292524",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgWarm: "#fafaf9",
} as const;

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // リクエスト取得
  const { data: reqRow, error } = await supabase
    .from("asset_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !reqRow) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}>
        <p className="text-sm font-medium" style={{ color: C.text }}>リクエストが見つかりません</p>
        <Link href="/admin/requests" className="text-xs underline" style={{ color: C.green }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  const request = reqRow as AssetRequest;

  // アイテム取得
  const { data: rawItems } = await supabase
    .from("asset_request_items")
    .select("*")
    .eq("request_id", id);

  // 素材を一括取得
  const assetIds = [...new Set((rawItems ?? []).map((i) => i.asset_id))];
  const { data: assetRows } = assetIds.length > 0
    ? await supabase.from("assets").select("*").in("id", assetIds)
    : { data: [] };

  const assetMap = new Map<string, Asset>((assetRows ?? []).map((a) => [a.id, a as Asset]));
  const items = (rawItems ?? []).map((item) => ({
    ...item,
    asset: assetMap.get(item.asset_id) ?? null,
  })) as (AssetRequestItem & { asset: Asset | null })[];

  // クライアント取得
  const { data: clientRows } = await supabase
    .from("clients")
    .select("*")
    .eq("id", request.client_id)
    .limit(1);

  const client = (clientRows?.[0] ?? null) as Client | null;

  if (!client) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}>
        <p className="text-sm" style={{ color: C.text }}>クライアント情報が見つかりません</p>
        <Link href="/admin/requests" className="text-xs underline" style={{ color: C.green }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  // 納品データ取得
  const { data: deliveryRows } = await supabase
    .from("deliveries")
    .select("*")
    .eq("request_id", id)
    .order("created_at");

  const deliveries = (deliveryRows ?? []) as Delivery[];

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}>
        <div className="flex items-center gap-3">
          <Link href="/admin/requests">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100"
              style={{ color: C.textFaint }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: C.text }}>リクエスト詳細</h1>
            <p className="text-xs font-mono" style={{ color: C.textFaint }}>{id.slice(0, 8)}...</p>
          </div>
        </div>
      </header>

      <RequestDetail request={request} items={items} client={client} deliveries={deliveries} />
    </div>
  );
}
