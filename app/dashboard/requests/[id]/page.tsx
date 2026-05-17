import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, Package, Coins, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentLineUserId } from "@/lib/auth";
import type { AssetRequest, AssetRequestItem, Asset, Delivery, Shoot } from "@/lib/types";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
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
    pending:   { label: "確認待ち", icon: <Clock className="h-3 w-3" />,        color: "#92400e", bg: "#fef3c7" },
    approved:  { label: "承認済み", icon: <CheckCircle className="h-3 w-3" />,  color: C.green,   bg: C.limePale },
    delivered: { label: "納品済み", icon: <Package className="h-3 w-3" />,      color: "#1d4ed8", bg: "#eff6ff" },
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

export default async function DashboardRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lineUserId = await getCurrentLineUserId();

  // Verify access: get user → client
  const { data: userRows } = await supabase
    .from("users")
    .select("id")
    .eq("line_user_id", lineUserId)
    .limit(1);
  const userId = userRows?.[0]?.id ?? null;

  const { data: cuRows } = userId
    ? await supabase.from("client_users").select("client_id").eq("user_id", userId).limit(1)
    : { data: [] };
  const clientId = cuRows?.[0]?.client_id ?? null;

  // Fetch request (verify it belongs to this client)
  const { data: reqRow } = await supabase
    .from("asset_requests")
    .select("*")
    .eq("id", id)
    .limit(1);

  const request = (reqRow?.[0] ?? null) as AssetRequest | null;

  if (!request || request.client_id !== clientId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center" style={{ backgroundColor: C.bgWarm }}>
        <p className="text-sm font-medium" style={{ color: C.text }}>リクエストが見つかりません</p>
        <Link href="/dashboard/requests" className="text-xs underline" style={{ color: C.green }}>
          一覧に戻る
        </Link>
      </div>
    );
  }

  // Fetch request items with assets
  const { data: rawItems } = await supabase
    .from("asset_request_items")
    .select("*")
    .eq("request_id", id);

  const assetIds = [...new Set((rawItems ?? []).map((i) => i.asset_id))];
  const { data: assetRows } = assetIds.length > 0
    ? await supabase.from("assets").select("*").in("id", assetIds)
    : { data: [] };

  const assetMap = new Map<string, Asset>((assetRows ?? []).map((a) => [a.id, a as Asset]));
  const items = (rawItems ?? []).map((item) => ({
    ...item,
    asset: assetMap.get(item.asset_id) ?? null,
  })) as (AssetRequestItem & { asset: Asset | null })[];

  // Fetch deliveries
  const { data: deliveryRows } = await supabase
    .from("deliveries")
    .select("*")
    .eq("request_id", id)
    .order("created_at");
  const deliveries = (deliveryRows ?? []) as Delivery[];

  // Fetch shoot
  let shoot: Shoot | null = null;
  if (request.shoot_id) {
    const { data: shootRow } = await supabase
      .from("shoots")
      .select("*")
      .eq("id", request.shoot_id)
      .single();
    shoot = (shootRow ?? null) as Shoot | null;
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard/requests">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ color: C.text }}>リクエスト詳細</h1>
            <p className="text-xs font-mono" style={{ color: C.textFaint }}>{id.slice(0, 8)}...</p>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-4 py-5">
        {/* ステータス + 撮影名 */}
        <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textFaint }}>ステータス</p>
            <StatusChip status={request.status} />
          </div>
          {shoot && (
            <p className="mt-2 text-sm" style={{ color: C.textMid }}>
              撮影: {shoot.title}
            </p>
          )}
          <p className="mt-1 text-xs" style={{ color: C.textFaint }}>
            {new Date(request.created_at).toLocaleDateString("ja-JP", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
          {request.message && (
            <p className="mt-2 rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: C.bgTint, color: C.textMid }}>
              {request.message}
            </p>
          )}
        </div>

        {/* 素材一覧 */}
        <div>
          <p className="mb-2 text-sm font-semibold" style={{ color: C.textMid }}>
            素材一覧（{items.length} 件）
          </p>
          <div className="space-y-2">
            {items.map((item) => {
              const a = item.asset;
              if (!a) return (
                <div key={item.id} className="rounded-xl bg-white px-4 py-3 text-sm" style={{ border: `1px solid ${C.border}`, color: C.textFaint }}>
                  削除された素材
                </div>
              );
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.text }}>{a.title}</p>
                    <p className="text-xs" style={{ color: C.textFaint }}>{a.asset_no}</p>
                  </div>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: C.limePale, color: C.green }}
                  >
                    <Coins className="h-3 w-3" style={{ color: C.lime }} />
                    {a.credit_cost} pt
                  </span>
                </div>
              );
            })}
          </div>

          {/* 合計 */}
          <div
            className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: C.limePale, border: `1px solid ${C.limeLight}` }}
          >
            <span className="text-sm font-medium" style={{ color: C.textMid }}>合計クレジット</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" style={{ color: C.lime }} />
              <span className="text-lg font-bold" style={{ color: C.green }}>{request.total_credit} pt</span>
            </div>
          </div>
        </div>

        {/* 納品データ */}
        {request.status === "delivered" && deliveries.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: C.textMid }}>
              納品データ（{deliveries.length} 件）
            </p>
            <div className="space-y-2">
              {deliveries.map((d) => (
                <a
                  key={d.id}
                  href={d.delivery_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.text }}>
                      {d.delivery_title ?? "納品データ"}
                    </p>
                    <p className="text-xs" style={{ color: C.textFaint }}>
                      {d.file_type}
                      {d.delivered_at
                        ? `　·　${new Date(d.delivered_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    style={{ backgroundColor: C.limePale, color: C.green }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    開く
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 納品URLレガシー表示 */}
        {request.status === "delivered" && request.delivery_url && deliveries.length === 0 && (
          <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
            <p className="mb-2 text-sm font-semibold" style={{ color: C.textMid }}>納品データ</p>
            <a
              href={request.delivery_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm"
              style={{ color: C.green }}
            >
              <ExternalLink className="h-4 w-4" />
              納品データを開く
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
