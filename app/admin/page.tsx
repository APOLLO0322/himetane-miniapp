import Link from "next/link";
import {
  Package,
  Upload,
  Clock,
  CheckCircle,
  ImageIcon,
  Users,
  ChevronRight,
  Inbox,
  Camera,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export default async function AdminPage() {
  // 統計データを並列取得
  const [
    { count: pendingCount },
    { count: totalRequests },
    { count: totalAssets },
    { count: totalClients },
  ] = await Promise.all([
    supabase.from("asset_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("asset_requests").select("*", { count: "exact", head: true }),
    supabase.from("assets").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
  ]);

  // 最新リクエスト3件
  const { data: recentRequests } = await supabase
    .from("asset_requests")
    .select("id, status, created_at, client_id")
    .order("created_at", { ascending: false })
    .limit(3);

  const clientIds = [...new Set((recentRequests ?? []).map((r) => r.client_id))];
  const { data: clients } = clientIds.length > 0
    ? await supabase.from("clients").select("id, name").in("id", clientIds)
    : { data: [] };
  const clientMap = new Map((clients ?? []).map((c) => [c.id, c.name]));

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "確認待ち", color: "#92400e", bg: "#fef3c7" },
    approved:  { label: "承認済み", color: C.green,   bg: C.limePale },
    delivered: { label: "納品済み", color: "#1d4ed8", bg: "#eff6ff" },
  };

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-4 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <h1 className="text-base font-bold" style={{ color: C.green }}>ヒメタネ 管理</h1>
      </header>

      <div className="px-4 pt-5 space-y-6">

        {/* 統計カード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "#fef3c7" }}>
                <Clock className="h-4 w-4" style={{ color: "#92400e" }} />
              </div>
              <p className="text-xs font-medium" style={{ color: C.textMuted }}>確認待ち</p>
            </div>
            <p className="mt-2 text-3xl font-bold" style={{ color: C.text }}>{pendingCount ?? 0}</p>
            <p className="text-xs" style={{ color: C.textFaint }}>件のリクエスト</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: C.limePale }}>
                <Package className="h-4 w-4" style={{ color: C.green }} />
              </div>
              <p className="text-xs font-medium" style={{ color: C.textMuted }}>リクエスト総数</p>
            </div>
            <p className="mt-2 text-3xl font-bold" style={{ color: C.text }}>{totalRequests ?? 0}</p>
            <p className="text-xs" style={{ color: C.textFaint }}>件</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: C.limePale }}>
                <ImageIcon className="h-4 w-4" style={{ color: C.green }} />
              </div>
              <p className="text-xs font-medium" style={{ color: C.textMuted }}>素材数</p>
            </div>
            <p className="mt-2 text-3xl font-bold" style={{ color: C.text }}>{totalAssets ?? 0}</p>
            <p className="text-xs" style={{ color: C.textFaint }}>件登録済み</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: C.limePale }}>
                <Users className="h-4 w-4" style={{ color: C.green }} />
              </div>
              <p className="text-xs font-medium" style={{ color: C.textMuted }}>クライアント数</p>
            </div>
            <p className="mt-2 text-3xl font-bold" style={{ color: C.text }}>{totalClients ?? 0}</p>
            <p className="text-xs" style={{ color: C.textFaint }}>社</p>
          </div>
        </div>

        {/* クイックアクション */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: C.textFaint }}>
            アクション
          </p>
          <div className="space-y-2">
            <Link href="/admin/requests">
              <div
                className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                style={{ border: `1px solid ${C.border}` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "#fef3c7" }}>
                  <Inbox className="h-5 w-5" style={{ color: "#92400e" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: C.text }}>リクエスト管理</p>
                  <p className="text-xs" style={{ color: C.textFaint }}>
                    {pendingCount ? `確認待ち ${pendingCount} 件あり` : "新着リクエストなし"}
                  </p>
                </div>
                {(pendingCount ?? 0) > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "#f59e0b" }}>
                    {pendingCount}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textFaint }} />
              </div>
            </Link>

            <Link href="/admin/shoots">
              <div
                className="flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                style={{ border: `1px solid ${C.border}` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: C.limePale }}>
                  <Camera className="h-5 w-5" style={{ color: C.green }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: C.text }}>撮影管理</p>
                  <p className="text-xs" style={{ color: C.textFaint }}>撮影フォルダ・素材を管理</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textFaint }} />
              </div>
            </Link>

            <Link href="/admin/assets/new">
              <div
                className="flex items-center gap-4 rounded-2xl px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDeep} 100%)`,
                  border: `1px solid ${C.green}`,
                }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                  <Upload className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">素材をアップロード</p>
                  <p className="text-xs" style={{ color: C.limeLight }}>ファイルを選択してDBに登録</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white opacity-70" />
              </div>
            </Link>
          </div>
        </div>

        {/* 最新リクエスト */}
        {(recentRequests ?? []).length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textFaint }}>
                最新リクエスト
              </p>
              <Link href="/admin/requests" className="text-xs" style={{ color: C.green }}>
                すべて見る
              </Link>
            </div>
            <div className="space-y-2">
              {(recentRequests ?? []).map((req) => {
                const s = statusLabel[req.status] ?? { label: req.status, color: C.textMuted, bg: C.bgTint };
                return (
                  <Link key={req.id} href={`/admin/requests/${req.id}`}>
                    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
                      style={{ border: `1px solid ${C.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: s.bg }}>
                        <CheckCircle className="h-4 w-4" style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium" style={{ color: C.text }}>
                          {clientMap.get(req.client_id) ?? "不明なクライアント"}
                        </p>
                        <p className="text-xs" style={{ color: C.textFaint }}>
                          {new Date(req.created_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
