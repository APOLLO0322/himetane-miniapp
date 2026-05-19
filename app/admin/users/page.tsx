import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { UserCircle, Plus, ChevronRight } from "lucide-react";
import type { User, ClientUser, Client } from "@/lib/types";

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

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  admin_all:      { label: "管理者（全権）", color: "#7c3aed", bg: "#ede9fe" },
  admin_creator:  { label: "クリエイター",   color: "#0369a1", bg: "#e0f2fe" },
  client_owner:   { label: "オーナー",        color: C.green,   bg: C.limePale },
  client_manager: { label: "マネージャー",    color: "#92400e", bg: "#fef3c7" },
};

export default async function AdminUsersPage() {
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at");

  if (error) {
    console.error("ユーザー取得エラー:", error.message);
  }

  const userList = (users ?? []) as User[];
  const userIds = userList.map((u) => u.id);

  const { data: clientUserRows } = userIds.length > 0
    ? await supabase.from("client_users").select("*").in("user_id", userIds)
    : { data: [] };

  const clientUsers = (clientUserRows ?? []) as ClientUser[];
  const clientIds = [...new Set(clientUsers.map((cu) => cu.client_id))];

  const { data: clientRows } = clientIds.length > 0
    ? await supabase.from("clients").select("id, name").in("id", clientIds)
    : { data: [] };

  const clientMap = new Map<string, string>((clientRows ?? []).map((c: Pick<Client, "id" | "name">) => [c.id, c.name]));

  const userClientMap = new Map<string, string>();
  for (const cu of clientUsers) {
    if (!userClientMap.has(cu.user_id)) {
      userClientMap.set(cu.user_id, clientMap.get(cu.client_id) ?? cu.client_id);
    }
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      <header
        className="sticky top-0 z-10 px-4 py-4 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: C.green }}>ユーザー管理</h1>
            <p className="text-xs" style={{ color: C.textFaint }}>{userList.length} 名</p>
          </div>
          <Link href="/admin/users/new">
            <button
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: C.green }}
            >
              <Plus className="h-4 w-4" />
              ユーザー追加
            </button>
          </Link>
        </div>
      </header>

      <div className="px-4 pt-5">
        {userList.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
              <UserCircle className="h-7 w-7" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: C.textMid }}>ユーザーがいません</p>
            <Link href="/admin/users/new">
              <button
                className="mt-4 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                最初のユーザーを追加
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userList.map((user) => {
              const badge = ROLE_BADGE[user.role] ?? { label: user.role, color: C.textMuted, bg: C.bgTint };
              const clientName = userClientMap.get(user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: C.bgTint }}>
                    <UserCircle className="h-5 w-5" style={{ color: C.textMuted }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold" style={{ color: C.text }}>
                        {user.line_display_name ?? user.line_user_id}
                      </p>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-mono" style={{ color: C.textFaint }}>{user.line_user_id}</p>
                    {clientName && (
                      <p className="mt-0.5 text-xs" style={{ color: C.textMuted }}>{clientName}</p>
                    )}
                    <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>
                      {new Date(user.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
