import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, CheckCircle, Package, Coins } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AssetRequest, Client } from "@/lib/types";

export const dynamic = "force-dynamic";

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

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending:  { label: "確認待ち", icon: <Clock className="h-3 w-3" />,       color: "#92400e", bg: "#fef3c7" },
  approved: { label: "承認済み", icon: <CheckCircle className="h-3 w-3" />, color: C.green,   bg: C.limePale },
  delivered:{ label: "納品済み", icon: <Package className="h-3 w-3" />,     color: "#1d4ed8", bg: "#eff6ff" },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, icon: null, color: C.textMuted, bg: C.bgTint };
  return (
    <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {s.icon}{s.label}
    </span>
  );
}

export default async function AdminRequestsPage() {
  // 全リクエストを取得
  const { data: requests } = await supabase
    .from("asset_requests")
    .select("*")
    .order("created_at", { ascending: false });

  // クライアント情報を一括取得
  const clientIds = [...new Set((requests ?? []).map((r) => r.client_id))];
  const { data: clients } = clientIds.length > 0
    ? await supabase.from("clients").select("id, name").in("id", clientIds)
    : { data: [] };

  const clientMap = new Map<string, Client>((clients ?? []).map((c) => [c.id, c as Client]));

  // アイテム数を一括取得
  const requestIds = (requests ?? []).map((r) => r.id);
  const { data: allItems } = requestIds.length > 0
    ? await supabase.from("asset_request_items").select("asset_request_id").in("asset_request_id", requestIds)
    : { data: [] };

  const itemCountMap = new Map<string, number>();
  for (const item of allItems ?? []) {
    itemCountMap.set(item.asset_request_id, (itemCountMap.get(item.asset_request_id) ?? 0) + 1);
  }

  const list = (requests ?? []) as AssetRequest[];

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-stone-100"
              style={{ color: C.textFaint }}>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold" style={{ color: C.text }}>リクエスト管理</h1>
            <p className="text-xs" style={{ color: C.textFaint }}>{list.length} 件</p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-3">
        {list.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="h-12 w-12" style={{ color: C.textFaint }} />
            <p className="mt-4 text-sm font-medium" style={{ color: C.textMid }}>リクエストがありません</p>
          </div>
        ) : (
          list.map((req) => {
            const client = clientMap.get(req.client_id);
            const itemCount = itemCountMap.get(req.id) ?? 0;
            return (
              <Link key={req.id} href={`/admin/requests/${req.id}`}>
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: `1px solid ${C.border}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: C.text }}>
                        {client?.name ?? "不明なクライアント"}
                      </p>
                      <StatusChip status={req.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: C.textFaint }}>
                      <span>{new Date(req.created_at).toLocaleDateString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span>素材 {itemCount} 件</span>
                    </div>
                    {req.note && (
                      <p className="mt-1 text-xs truncate" style={{ color: C.textMuted }}>
                        メモ: {req.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
                      style={{ backgroundColor: C.limePale }}>
                      <Coins className="h-3 w-3" style={{ color: C.lime }} />
                      <span className="text-xs font-semibold" style={{ color: C.green }}>{req.total_credit} pt</span>
                    </div>
                    <ChevronRight className="h-4 w-4" style={{ color: C.textFaint }} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
