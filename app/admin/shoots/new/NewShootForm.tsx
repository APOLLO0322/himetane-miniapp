"use client";

import { useState } from "react";
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

export default function NewShootForm({ clients }: { clients: Pick<Client, "id" | "name">[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [shootDate, setShootDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !title.trim()) {
      setError("クライアントとタイトルは必須です");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shoots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: title.trim(),
          shoot_date: shootDate || null,
          status,
          memo: memo.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      router.push(`/admin/shoots/${json.shoot_id}`);
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
      {/* クライアント */}
      <div>
        <label style={labelStyle}>クライアント <span style={{ color: "#e11d48" }}>*</span></label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={inputStyle}
          required
        >
          {clients.length === 0 && <option value="">クライアントがありません</option>}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* タイトル */}
      <div>
        <label style={labelStyle}>タイトル <span style={{ color: "#e11d48" }}>*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="2024年春　商品撮影"
          style={inputStyle}
          required
        />
      </div>

      {/* 撮影日 */}
      <div>
        <label style={labelStyle}>撮影日</label>
        <input
          type="date"
          value={shootDate}
          onChange={(e) => setShootDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ステータス */}
      <div>
        <label style={labelStyle}>ステータス</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="scheduled">予定</option>
          <option value="completed">完了</option>
        </select>
      </div>

      {/* メモ */}
      <div>
        <label style={labelStyle}>メモ（任意）</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="撮影に関するメモを入力..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* エラー */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-rose-600"
          style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: C.green }}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />作成中...</>
        ) : "撮影を作成する"}
      </button>
    </form>
  );
}
