"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

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

export default function NewClientForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [planStatus, setPlanStatus] = useState("active");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("店舗名は必須です");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), plan_status: planStatus, memo: memo.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      router.push(`/admin/clients/${json.data.id}`);
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
        <label style={labelStyle}>店舗名 <span style={{ color: "#e11d48" }}>*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="株式会社〇〇"
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>プランステータス</label>
        <select value={planStatus} onChange={(e) => setPlanStatus(e.target.value)} style={inputStyle}>
          <option value="active">稼働中</option>
          <option value="trial">トライアル</option>
          <option value="inactive">停止中</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>メモ（任意）</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="備考・特記事項..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

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
        ) : "クライアントを作成する"}
      </button>
    </form>
  );
}
