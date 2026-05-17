import Link from "next/link";
import { ArrowLeft, ShoppingCart, Clock, CheckCircle, XCircle, Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
import type { AssetRequest, AssetRequestItem, Asset } from "@/lib/types";

const C = {
  green: "#007956",
  greenDeep: "#004530",
  lime: "#9dc926",
  limeLight: "#d4e8a0",
  limePale: "#f0fdf4",
  text: "#292524",
  textMid: "#44403b",
  textMuted: "#79716b",
  textFaint: "#a6a09b",
  border: "#e7e5e4",
  bgTint: "#f5f5f4",
  bgWarm: "#fafaf9",
} as const;

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    pending: {
      label: "確認待ち",
      icon: <Clock className="h-3 w-3" />,
      color: "#92400e",
      bg: "#fef3c7",
    },
    approved: {
      label: "承認済み",
      icon: <CheckCircle className="h-3 w-3" />,
      color: C.green,
      bg: C.limePale,
    },
    rejected: {
      label: "却下",
      icon: <XCircle className="h-3 w-3" />,
      color: "#e11d48",
      bg: "#fff1f2",
    },
  };
  const s = map[status] ?? { label: status, icon: null, color: C.textMuted, bg: C.bgTint };
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

type RequestWithItems = AssetRequest & {
  items: (AssetRequestItem & { asset: Asset | null })[];
};

// 将来: LIFF.getProfile().userId で差し替える
const LINE_USER_ID = "U_TEST_USER_001";

export default async function RequestsPage() {
  // user起点でclientを取得
  const { data: userRows } = await supabase
    .from("users")
    .select("id")
    .eq("line_user_id", LINE_USER_ID)
    .limit(1);

  const userId = userRows?.[0]?.id ?? null;

  const { data: clientUserRows } = userId
    ? await supabase.from("client_users").select("client_id").eq("user_id", userId).limit(1)
    : { data: [] };

  const clientId = clientUserRows?.[0]?.client_id ?? null;

  const { data: clientRows } = clientId
    ? await supabase.from("clients").select("id, name").eq("id", clientId).limit(1)
    : { data: [] };

  const client = clientRows?.[0];
  if (!client) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ backgroundColor: C.bgWarm }}
      >
        <ShoppingCart className="h-12 w-12" style={{ color: C.textFaint }} />
        <p className="text-sm font-medium" style={{ color: C.textMid }}>
          クライアント情報が見つかりません
        </p>
        <Link href="/dashboard" className="text-xs underline" style={{ color: C.green }}>
          ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  // リクエスト一覧
  const { data: requests } = await supabase
    .from("asset_requests")
    .select("*")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  // 全アイテムを一括取得
  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: rawItems } = requestIds.length > 0
    ? await supabase
        .from("asset_request_items")
        .select("*")
        .in("request_id", requestIds)
    : { data: [] };

  // アイテムに紐づくアセットを一括取得
  const assetIds = [...new Set((rawItems ?? []).map((i) => i.asset_id))];
  const { data: assetRows } = assetIds.length > 0
    ? await supabase.from("assets").select("*").in("id", assetIds)
    : { data: [] };

  const assetMap = new Map<string, Asset>((assetRows ?? []).map((a) => [a.id, a]));

  // リクエストごとにアイテムをグループ化
  const itemsByRequest = new Map<string, (AssetRequestItem & { asset: Asset | null })[]>();
  for (const item of rawItems ?? []) {
    const list = itemsByRequest.get(item.request_id) ?? [];
    list.push({ ...item, asset: assetMap.get(item.asset_id) ?? null });
    itemsByRequest.set(item.request_id, list);
  }

  const enriched: RequestWithItems[] = (requests ?? []).map((r) => ({
    ...r,
    items: itemsByRequest.get(r.id) ?? [],
  }));

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{
          borderBottom: `1px solid ${C.border}`,
          backgroundColor: "rgba(250,250,249,0.85)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: C.text }}>
              リクエスト履歴
            </h1>
            <p className="text-xs" style={{ color: C.textFaint }}>
              {client.name}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5">
        {enriched.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: C.bgTint }}
            >
              <ShoppingCart className="h-7 w-7" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: C.textMid }}>
              リクエスト履歴がありません
            </p>
            <p className="mt-1 text-xs" style={{ color: C.textFaint }}>
              素材ライブラリから素材を選んでリクエストしてください
            </p>
            <Link href="/dashboard">
              <button
                className="mt-5 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                素材を選ぶ
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enriched.map((req) => (
              <div
                key={req.id}
                className="overflow-hidden rounded-2xl bg-white"
                style={{ border: `1px solid ${C.border}` }}
              >
                {/* リクエストヘッダー */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="text-xs font-mono" style={{ color: C.textFaint }}>
                      {new Date(req.created_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: C.text }}>
                      {req.items.length} 件の素材
                    </p>
                  </div>
                  <StatusChip status={req.status} />
                </div>

                {/* アイテムリスト */}
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {req.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium" style={{ color: C.text }}>
                          {item.asset?.title ?? "削除された素材"}
                        </p>
                        <p className="text-xs" style={{ color: C.textFaint }}>
                          {item.asset?.asset_no ?? "-"}
                        </p>
                      </div>
                      {item.asset && (
                        <span
                          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: C.limePale, color: C.green }}
                        >
                          <Coins className="h-3 w-3" style={{ color: C.lime }} />
                          {item.asset.credit_cost} pt
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* フッター（合計・メモ） */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: C.bgTint, borderTop: `1px solid ${C.border}` }}
                >
                  <span className="text-xs" style={{ color: C.textFaint }}>
                    {req.message ? `メモ: ${req.message}` : ""}
                  </span>
                  <div
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                    style={{ backgroundColor: C.limePale, color: C.green }}
                  >
                    <Coins className="h-3.5 w-3.5" style={{ color: C.lime }} />
                    {req.total_credit} pt
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
