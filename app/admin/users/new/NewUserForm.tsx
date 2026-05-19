"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Client } from "@/lib/types";

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

const ROLE_OPTIONS = [
  { value: "admin_all",      label: "管理者（全権）" },
  { value: "admin_creator",  label: "クリエイター" },
  { value: "client_owner",   label: "オーナー" },
  { value: "client_manager", label: "マネージャー" },
];

export default function NewUserForm() {
  const router = useRouter();
  const [lineUserId, setLineUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("client_manager");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsClient = role === "client_owner" || role === "client_manager";

  useEffect(() => {
    if (!needsClient) return;
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setClients(json.data);
      })
      .catch(() => null);
  }, [needsClient]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lineUserId.trim() || !displayName.trim()) {
      setError("LINE User ID と表示名は必須です");
      return;
    }
    if (needsClient && !clientId) {
      setError("クライアントを選択してください");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_user_id: lineUserId.trim(),
          line_display_name: displayName.trim(),
          role,
          client_id: needsClient ? clientId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setSubmitting(false);
    }
  }

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
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: C.textMid,
    marginBottom: "0.375rem",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5">
      <div>
        <label style={labelStyle}>LINE User ID <span style={{ color: "#e11d48" }}>*</span></label>
        <input
          type="text"
          value={lineUserId}
          onChange={(e) => setLineUserId(e.target.value)}
          placeholder="U1234567890abcdef"
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>表示名 <span style={{ color: "#e11d48" }}>*</span></label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="山田 太郎"
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>役割</label>
        <select value={role} onChange={(e) => { setRole(e.target.value); setClientId(""); }} style={inputStyle}>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {needsClient && (
        <div>
          <label style={labelStyle}>クライアント <span style={{ color: "#e11d48" }}>*</span></label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputStyle} required>
            <option value="">選択してください</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-rose-600"
          style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />作成中...</>
        ) : "ユーザーを追加する"}
      </button>
    </form>
  );
}
