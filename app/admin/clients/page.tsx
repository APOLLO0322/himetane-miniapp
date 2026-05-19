import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Building2, Plus, ChevronRight, Users } from "lucide-react";
import type { Client } from "@/lib/types";

export const dynamic = "force-dynamic";

const C = {
  green: "#007956",
  greenDark: "#005e40",
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

const PLAN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "稼働中",     color: C.green,   bg: C.limePale },
  trial:    { label: "トライアル", color: "#0369a1", bg: "#e0f2fe" },
  inactive: { label: "停止中",     color: "#9f1239", bg: "#fff1f2" },
};

function PlanChip({ status }: { status: string | null }) {
  const s = status ? (PLAN_BADGE[status] ?? { label: status, color: C.textMuted, bg: C.bgTint }) : { label: "未設定", color: C.textFaint, bg: C.bgTint };
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default async function AdminClientsPage() {
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("クライアント取得エラー:", error.message);
  }

  const clientList = (clients ?? []) as Client[];
  const clientIds = clientList.map((c) => c.id);

  const { data: clientUsers } = clientIds.length > 0
    ? await supabase.from("client_users").select("client_id").in("client_id", clientIds)
    : { data: [] };

  const { data: shoots } = clientIds.length > 0
    ? await supabase.from("shoots").select("client_id").in("client_id", clientIds)
    : { data: [] };

  const userCountMap = new Map<string, number>();
  for (const cu of clientUsers ?? []) {
    userCountMap.set(cu.client_id, (userCountMap.get(cu.client_id) ?? 0) + 1);
  }

  const shootCountMap = new Map<string, number>();
  for (const s of shoots ?? []) {
    shootCountMap.set(s.client_id, (shootCountMap.get(s.client_id) ?? 0) + 1);
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header
        className="sticky top-0 z-10 px-4 py-4 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: C.green }}>クライアント管理</h1>
            <p className="text-xs" style={{ color: C.textFaint }}>{clientList.length} 件</p>
          </div>
          <Link href="/admin/clients/new">
            <button
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: C.green }}
            >
              <Plus className="h-4 w-4" />
              新規クライアント
            </button>
          </Link>
        </div>
      </header>

      <div className="px-4 pt-5">
        {clientList.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
              <Building2 className="h-7 w-7" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: C.textMid }}>クライアントがありません</p>
            <Link href="/admin/clients/new">
              <button
                className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                最初のクライアントを作成
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clientList.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <div
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm transition-shadow hover:shadow-md"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: C.limePale }}>
                    <Building2 className="h-5 w-5" style={{ color: C.green }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold" style={{ color: C.text }}>{client.name}</p>
                      <PlanChip status={client.plan_status} />
                    </div>
                    <div className="mt-1 flex gap-3 text-xs" style={{ color: C.textMuted }}>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {userCountMap.get(client.id) ?? 0} 名
                      </span>
                      <span>撮影 {shootCountMap.get(client.id) ?? 0} 件</span>
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
