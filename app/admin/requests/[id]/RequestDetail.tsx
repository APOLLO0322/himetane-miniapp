"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock, CheckCircle, Package, Coins, Camera, Video,
  Link2, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { AssetRequest, AssetRequestItem, Asset, Client } from "@/lib/types";

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

const STATUSES = [
  { value: "pending",   label: "確認待ち", icon: <Clock className="h-4 w-4" />,        color: "#92400e", bg: "#fef3c7" },
  { value: "approved",  label: "承認済み", icon: <CheckCircle className="h-4 w-4" />,   color: C.green,   bg: C.limePale },
  { value: "delivered", label: "納品済み", icon: <Package className="h-4 w-4" />,       color: "#1d4ed8", bg: "#eff6ff" },
] as const;

function isVideo(fileType: string) {
  return fileType.startsWith("video") || fileType === "video";
}

type Props = {
  request: AssetRequest;
  items: (AssetRequestItem & { asset: Asset | null })[];
  client: Client;
};

export default function RequestDetail({ request, items, client }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [deliveryUrl, setDeliveryUrl] = useState(request.delivery_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanged = status !== request.status || deliveryUrl !== (request.delivery_url ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          delivery_url: deliveryUrl || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 px-4 py-5">
      {/* クライアント情報 */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textFaint }}>クライアント</p>
        <p className="mt-1 text-base font-bold" style={{ color: C.text }}>{client.name}</p>
        <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: C.textFaint }}>
          <span>{new Date(request.created_at).toLocaleDateString("ja-JP", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
          })}</span>
        </div>
        {request.message && (
          <p className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: C.bgTint, color: C.textMid }}>
            メモ: {request.message}
          </p>
        )}
      </div>

      {/* 素材一覧 */}
      <div>
        <p className="mb-2 text-sm font-semibold" style={{ color: C.textMid }}>
          素材一覧（{items.length} 件）
        </p>
        <div className="space-y-2">
          {items.map((item) => {
            const a = item.asset;
            if (!a) return (
              <div key={item.id} className="rounded-xl bg-white px-4 py-3 text-sm" style={{ border: `1px solid ${C.border}`, color: C.textFaint }}>
                削除された素材
              </div>
            );
            const video = isVideo(a.file_type);
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3"
                style={{ border: `1px solid ${C.border}` }}>
                {/* サムネ */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg"
                  style={{ backgroundColor: C.bgTint }}>
                  {a.preview_url ? (
                    <Image src={a.preview_url} alt={a.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {video
                        ? <Video className="h-5 w-5" style={{ color: C.textFaint }} />
                        : <Camera className="h-5 w-5" style={{ color: C.textFaint }} />}
                    </div>
                  )}
                </div>
                {/* 情報 */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono" style={{ color: C.textFaint }}>{a.asset_no}</p>
                  <p className="truncate text-sm font-medium" style={{ color: C.text }}>{a.title}</p>
                </div>
                {/* クレジット */}
                <div className="flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0"
                  style={{ backgroundColor: C.limePale }}>
                  <Coins className="h-3 w-3" style={{ color: C.lime }} />
                  <span className="text-xs font-semibold" style={{ color: C.green }}>{a.credit_cost} pt</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 合計 */}
        <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: C.limePale, border: `1px solid ${C.limeLight}` }}>
          <span className="text-sm font-medium" style={{ color: C.textMid }}>合計クレジット</span>
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4" style={{ color: C.lime }} />
            <span className="text-lg font-bold" style={{ color: C.green }}>{request.total_credit} pt</span>
          </div>
        </div>
      </div>

      {/* ステータス変更 */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
        <p className="mb-3 text-sm font-semibold" style={{ color: C.textMid }}>ステータス</p>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-all"
              style={status === s.value
                ? { borderColor: s.color, backgroundColor: s.bg, color: s.color }
                : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
        {status === "delivered" && (
          <p className="mt-2 text-xs" style={{ color: "#1d4ed8" }}>
            納品済みにするとクレジットが自動で消費されます
          </p>
        )}
      </div>

      {/* 納品URL */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
        <label className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.textMid }}>
          <Link2 className="h-4 w-4" style={{ color: C.green }} />
          納品URL（任意）
        </label>
        <Input
          value={deliveryUrl}
          onChange={(e) => setDeliveryUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="mt-2 rounded-xl bg-white text-sm"
          style={{ borderColor: C.border }}
          type="url"
        />
        <p className="mt-1 text-xs" style={{ color: C.textFaint }}>
          Google Drive / Dropbox などの共有リンクを入力してください
        </p>
      </div>

      {/* エラー / 成功 */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-rose-600"
          style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: C.limePale, border: `1px solid ${C.limeLight}`, color: C.green }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          保存しました
        </div>
      )}

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={saving || !hasChanged}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: C.green }}
      >
        {saving ? (
          <><Loader2 className="h-4 w-4 animate-spin" />保存中...</>
        ) : (
          "変更を保存する"
        )}
      </button>
    </div>
  );
}
