"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCircle, Loader2, CheckCircle2, Trash2, Plus } from "lucide-react";
import type { User, Client, ClientUser } from "@/lib/types";

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

const ROLE_OPTIONS = [
  { value: "admin_all",      label: "管理者（全権）" },
  { value: "admin_creator",  label: "クリエイター" },
  { value: "client_owner",   label: "オーナー" },
  { value: "client_manager", label: "マネージャー" },
];

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  admin_all:      { label: "管理者（全権）", color: "#7c3aed", bg: "#ede9fe" },
  admin_creator:  { label: "クリエイター",   color: "#0369a1", bg: "#e0f2fe" },
  client_owner:   { label: "オーナー",        color: C.green,   bg: C.limePale },
  client_manager: { label: "マネージャー",    color: "#92400e", bg: "#fef3c7" },
};

type Props = {
  user: User;
  clientUsers: ClientUser[];
  allClients: Pick<Client, "id" | "name">[];
};

export default function UserDetailClient({ user, clientUsers: initial, allClients }: Props) {
  const router = useRouter();
  const [clientUsers, setClientUsers] = useState<ClientUser[]>(initial);

  // 店舗紐付けフォーム
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"client_owner" | "client_manager">("client_owner");
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // 紐付け解除
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const linkedClientIds = new Set(clientUsers.map((cu) => cu.client_id));
  const unlinkedClients = allClients.filter((c) => !linkedClientIds.has(c.id));

  async function handleLink() {
    if (!selectedClientId) return;
    setLinking(true);
    setLinkError(null);
    setLinkSuccess(false);

    const res = await fetch(`/api/admin/users/${user.id}/link-client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: selectedClientId, role: selectedRole }),
    });
    const json = await res.json();

    if (!res.ok) {
      setLinkError(json.error ?? "エラーが発生しました");
    } else {
      setLinkSuccess(true);
      setSelectedClientId("");
      setTimeout(() => setLinkSuccess(false), 3000);
      router.refresh();
    }
    setLinking(false);
  }

  async function handleUnlink(clientId: string) {
    setUnlinkingId(clientId);
    const res = await fetch(`/api/admin/users/${user.id}/link-client`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });
    if (res.ok) {
      setClientUsers((prev) => prev.filter((cu) => cu.client_id !== clientId));
    }
    setUnlinkingId(null);
  }

  const badge = ROLE_BADGE[user.role] ?? { label: user.role, color: C.textMuted, bg: C.bgTint };

  const inputStyle = {
    width: "100%",
    borderRadius: "0.75rem",
    border: `1px solid ${C.border}`,
    backgroundColor: "white",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: C.text,
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "0.75rem",
    fontWeight: 500 as const,
    color: C.textMid,
    marginBottom: "0.375rem",
  };

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.9)" }}
      >
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" style={{ color: C.textMuted }} />
        </button>
        <h1 className="text-base font-bold" style={{ color: C.green }}>ユーザー詳細</h1>
      </header>

      <div className="space-y-4 px-4 pt-5">
        {/* ユーザー情報 */}
        <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: C.bgTint }}>
              <UserCircle className="h-6 w-6" style={{ color: C.textMuted }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold" style={{ color: C.text }}>
                  {user.line_display_name ?? "（名前未設定）"}
                </p>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-mono" style={{ color: C.textFaint }}>{user.line_user_id}</p>
              <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>
                登録: {new Date(user.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        </div>

        {/* 現在の店舗紐付け */}
        <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
          <p className="mb-3 text-sm font-semibold" style={{ color: C.textMid }}>
            紐付け済み店舗（{clientUsers.length}）
          </p>
          {clientUsers.length === 0 ? (
            <p className="text-sm" style={{ color: C.textFaint }}>まだ店舗に紐付けられていません</p>
          ) : (
            <div className="space-y-2">
              {clientUsers.map((cu) => {
                const clientName = allClients.find((c) => c.id === cu.client_id)?.name ?? cu.client_id;
                const cuBadge = ROLE_BADGE[cu.role] ?? { label: cu.role, color: C.textMuted, bg: C.bgTint };
                const isUnlinking = unlinkingId === cu.client_id;
                return (
                  <div
                    key={cu.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: C.bgTint }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: C.text }}>{clientName}</p>
                      <span className="text-xs rounded-full px-2 py-0.5 font-medium" style={{ backgroundColor: cuBadge.bg, color: cuBadge.color }}>
                        {cuBadge.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleUnlink(cu.client_id)}
                      disabled={isUnlinking}
                      className="rounded-lg p-1.5 disabled:opacity-50"
                      style={{ color: "#dc2626" }}
                    >
                      {isUnlinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 店舗紐付けフォーム */}
        {unlinkedClients.length > 0 && (
          <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
            <p className="mb-3 text-sm font-semibold" style={{ color: C.textMid }}>店舗に紐付ける</p>
            <div className="space-y-3">
              <div>
                <label style={labelStyle}>店舗</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">選択してください</option>
                  {unlinkedClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>権限</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as "client_owner" | "client_manager")}
                  style={inputStyle}
                >
                  <option value="client_owner">オーナー</option>
                  <option value="client_manager">マネージャー</option>
                </select>
              </div>

              {linkError && (
                <p className="text-sm text-rose-600">{linkError}</p>
              )}
              {linkSuccess && (
                <div className="flex items-center gap-2 text-sm" style={{ color: C.green }}>
                  <CheckCircle2 className="h-4 w-4" />
                  紐付けしました
                </div>
              )}

              <button
                onClick={handleLink}
                disabled={!selectedClientId || linking}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: C.green }}
              >
                {linking ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />紐付け中...</>
                ) : (
                  <><Plus className="h-4 w-4" />紐付ける</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
