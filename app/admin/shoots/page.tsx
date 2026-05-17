import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Camera, Plus, ChevronRight, CalendarDays } from "lucide-react";
import type { Shoot, Client } from "@/lib/types";

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

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    scheduled: { label: "予定", color: "#92400e", bg: "#fef3c7" },
    completed:  { label: "完了", color: C.green,   bg: C.limePale },
    archived:   { label: "アーカイブ", color: C.textMuted, bg: C.bgTint },
  };
  const s = map[status] ?? { label: status, color: C.textMuted, bg: C.bgTint };
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default async function AdminShootsPage() {
  // Fetch all shoots ordered by shoot_date desc
  const { data: shoots } = await supabase
    .from("shoots")
    .select("*")
    .order("shoot_date", { ascending: false });

  const shootList = (shoots ?? []) as Shoot[];

  // Fetch client names
  const clientIds = [...new Set(shootList.map((s) => s.client_id))];
  const { data: clientRows } = clientIds.length > 0
    ? await supabase.from("clients").select("id, name").in("id", clientIds)
    : { data: [] };
  const clientMap = new Map<string, string>((clientRows ?? []).map((c) => [c.id, c.name]));

  // Count assets per shoot
  const shootIds = shootList.map((s) => s.id);
  const { data: assetCounts } = shootIds.length > 0
    ? await supabase.from("assets").select("shoot_id").in("shoot_id", shootIds)
    : { data: [] };
  const assetCountMap = new Map<string, number>();
  for (const a of assetCounts ?? []) {
    if (a.shoot_id) assetCountMap.set(a.shoot_id, (assetCountMap.get(a.shoot_id) ?? 0) + 1);
  }

  // Count requests per shoot
  const { data: requestCounts } = shootIds.length > 0
    ? await supabase.from("asset_requests").select("shoot_id").in("shoot_id", shootIds)
    : { data: [] };
  const requestCountMap = new Map<string, number>();
  for (const r of requestCounts ?? []) {
    if (r.shoot_id) requestCountMap.set(r.shoot_id, (requestCountMap.get(r.shoot_id) ?? 0) + 1);
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header
        className="sticky top-0 z-10 px-4 py-4 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: C.green }}>撮影管理</h1>
            <p className="text-xs" style={{ color: C.textFaint }}>{shootList.length} 件の撮影</p>
          </div>
          <Link href="/admin/shoots/new">
            <button
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: C.green }}
            >
              <Plus className="h-4 w-4" />
              新規撮影
            </button>
          </Link>
        </div>
      </header>

      <div className="px-4 pt-5">
        {shootList.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
              <Camera className="h-7 w-7" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: C.textMid }}>撮影データがありません</p>
            <Link href="/admin/shoots/new">
              <button
                className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                最初の撮影を作成
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {shootList.map((shoot) => (
              <Link key={shoot.id} href={`/admin/shoots/${shoot.id}`}>
                <div
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: C.limePale }}
                  >
                    <CalendarDays className="h-5 w-5" style={{ color: C.green }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold" style={{ color: C.text }}>
                        {shoot.title}
                      </p>
                      <StatusChip status={shoot.status} />
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>
                      {clientMap.get(shoot.client_id) ?? "不明"}
                      {shoot.shoot_date
                        ? `　·　${new Date(shoot.shoot_date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}`
                        : "　·　日付未設定"}
                    </p>
                    <div className="mt-1 flex gap-3 text-xs" style={{ color: C.textMuted }}>
                      <span>素材 {assetCountMap.get(shoot.id) ?? 0} 件</span>
                      <span>リクエスト {requestCountMap.get(shoot.id) ?? 0} 件</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textFaint }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
