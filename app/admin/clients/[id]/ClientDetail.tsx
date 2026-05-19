"use client";

import { useState } from "react";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import type { Client, ClientUser, User, Shoot, CreditTransaction } from "@/lib/types";

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

const PLAN_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "稼働中",     color: C.green,   bg: C.limePale },
  trial:    { label: "トライアル", color: "#0369a1", bg: "#e0f2fe" },
  inactive: { label: "停止中",     color: "#9f1239", bg: "#fff1f2" },
};

type Props = {
  client: Client;
  clientUsers: (ClientUser & { user: User | null })[];
  shoots: Shoot[];
  transactions: CreditTransaction[];
};

export default function ClientDetail({ client, clientUsers, shoots, transactions }: Props) {
  const [lineUserId, setLineUserId] = useState("");
  const [addRole, setAddRole] = useState("client_manager");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!lineUserId.trim()) {
      setAddError("LINE User ID は必須です");
      return;
    }
    setAdding(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_user_id: lineUserId.trim(), role: addRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setAddSuccess(true);
      setLineUserId("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setAdding(false);
    }
  }

  const planBadge = client.plan_status ? (PLAN_BADGE[client.plan_status] ?? { label: client.plan_status, color: C.textMuted, bg: C.bgTint }) : null;

  const inputStyle = {
    flex: 1,
    borderRadius: "0.75rem",
    border: `1px solid ${C.border}`,
    backgroundColor: "white",
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: C.text,
    outline: "none",
  };

  return (
    <div className="space-y-6 px-4 py-5">
      {/* 店舗情報 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: C.text }}>{client.name}</h2>
          {planBadge && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: planBadge.bg, color: planBadge.color }}>
              {planBadge.label}
            </span>
          )}
        </div>
        {client.memo && (
          <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: C.textMuted }}>{client.memo}</p>
        )}
        <p className="mt-2 text-xs" style={{ color: C.textFaint }}>
          作成日: {new Date(client.created_at).toLocaleDateString("ja-JP")}
        </p>
      </div>

      {/* 紐づくユーザー */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: C.textFaint }}>ユーザー</p>
        <div className="space-y-2">
          {clientUsers.length === 0 ? (
            <p className="text-sm" style={{ color: C.textMuted }}>ユーザーがいません</p>
          ) : clientUsers.map((cu) => {
            const badge = ROLE_BADGE[cu.role] ?? { label: cu.role, color: C.textMuted, bg: C.bgTint };
            return (
              <div key={cu.id} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.text }}>
                    {cu.user?.line_display_name ?? cu.user?.line_user_id ?? "不明"}
                  </p>
                  <p className="text-xs" style={{ color: C.textFaint }}>{cu.user?.line_user_id}</p>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0" style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ユーザー追加フォーム */}
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
          <p className="mb-3 text-xs font-semibold" style={{ color: C.textMid }}>ユーザーを追加</p>
          <form onSubmit={handleAddUser} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={lineUserId}
                onChange={(e) => setLineUserId(e.target.value)}
                placeholder="LINE User ID"
                style={inputStyle}
              />
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value)}
                style={{ ...inputStyle, flex: "none", width: "auto" }}
              >
                <option value="client_owner">オーナー</option>
                <option value="client_manager">マネージャー</option>
              </select>
            </div>
            {addError && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600" style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}>
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{addError}
              </div>
            )}
            {addSuccess && (
              <p className="text-xs" style={{ color: C.green }}>ユーザーを追加しました</p>
            )}
            <button
              type="submit"
              disabled={adding}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: C.green }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              追加
            </button>
          </form>
        </div>
      </div>

      {/* 撮影一覧 */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: C.textFaint }}>撮影 ({shoots.length})</p>
        {shoots.length === 0 ? (
          <p className="text-sm" style={{ color: C.textMuted }}>撮影データがありません</p>
        ) : (
          <div className="space-y-2">
            {shoots.map((shoot) => (
              <div key={shoot.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
                <p className="text-sm font-medium" style={{ color: C.text }}>{shoot.title}</p>
                <p className="text-xs" style={{ color: C.textFaint }}>
                  {shoot.shoot_date ? new Date(shoot.shoot_date).toLocaleDateString("ja-JP") : "日付未設定"}
                  　·　{shoot.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* クレジット履歴 */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: C.textFaint }}>クレジット履歴 ({transactions.length})</p>
        {transactions.length === 0 ? (
          <p className="text-sm" style={{ color: C.textMuted }}>履歴がありません</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm" style={{ border: `1px solid ${C.border}` }}>
                <div>
                  <p className="text-sm" style={{ color: C.text }}>{tx.description ?? tx.transaction_type ?? "取引"}</p>
                  <p className="text-xs" style={{ color: C.textFaint }}>{new Date(tx.created_at).toLocaleDateString("ja-JP")}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: tx.amount >= 0 ? C.green : "#9f1239" }}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount} pt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
