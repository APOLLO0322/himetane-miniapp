"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera, Video, AlertCircle, Loader2, CheckCircle2, Link2,
} from "lucide-react";
import type { Shoot, Asset, Client } from "@/lib/types";

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

function isVideo(fileType: string) {
  return fileType.startsWith("video") || fileType === "video";
}

function AssetStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:      { label: "下書き",     color: C.textMuted, bg: C.bgTint },
    selectable: { label: "選択可",     color: C.green,     bg: C.limePale },
    requested:  { label: "リクエスト済", color: "#1d4ed8", bg: "#eff6ff" },
    delivered:  { label: "納品済み",   color: "#92400e",   bg: "#fef3c7" },
    archived:   { label: "アーカイブ", color: C.textFaint, bg: C.bgTint },
  };
  const s = map[status] ?? { label: status, color: C.textMuted, bg: C.bgTint };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

type Props = {
  shoot: Shoot;
  client: Client;
  assets: Asset[];
};

export default function ShootDetail({ shoot, client, assets: initialAssets }: Props) {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  // Asset add form state
  // NOTE: Vercel Blob (BLOB_READ_WRITE_TOKEN) is not configured yet.
  // Using URL input instead of file picker for now.
  const [addTitle, setAddTitle] = useState("");
  const [addFileType, setAddFileType] = useState("photo");
  const [addCreditCost, setAddCreditCost] = useState(1);
  const [addPreviewUrl, setAddPreviewUrl] = useState("");
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleAddAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!addTitle.trim()) {
      setAddError("タイトルは必須です");
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      const res = await fetch(`/api/admin/shoots/${shoot.id}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addTitle.trim(),
          file_type: addFileType,
          credit_cost: addCreditCost,
          preview_url: addPreviewUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setAssets((prev) => [...prev, json.asset]);
      setAddTitle("");
      setAddPreviewUrl("");
      setAddCreditCost(1);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setAddSubmitting(false);
    }
  }

  async function handleStatusChange(assetId: string, newStatus: string) {
    setUpdatingId(assetId);
    try {
      const res = await fetch(`/api/admin/shoots/${shoot.id}/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setAssets((prev) => prev.map((a) => a.id === assetId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("ステータス更新エラー:", err);
    } finally {
      setUpdatingId(null);
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
    fontWeight: 500 as const,
    color: C.textMid,
    marginBottom: "0.375rem",
  };

  return (
    <div className="space-y-5 px-4 py-5">
      {/* 撮影情報 */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textFaint }}>撮影情報</p>
        <p className="mt-1 text-base font-bold" style={{ color: C.text }}>{shoot.title}</p>
        <p className="mt-0.5 text-sm" style={{ color: C.textMuted }}>{client.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: C.textFaint }}>
          {shoot.shoot_date && (
            <span>
              {new Date(shoot.shoot_date).toLocaleDateString("ja-JP", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={
              shoot.status === "completed"
                ? { backgroundColor: C.limePale, color: C.green }
                : shoot.status === "archived"
                ? { backgroundColor: C.bgTint, color: C.textMuted }
                : { backgroundColor: "#fef3c7", color: "#92400e" }
            }
          >
            {shoot.status === "scheduled" ? "予定" : shoot.status === "completed" ? "完了" : shoot.status === "archived" ? "アーカイブ" : shoot.status}
          </span>
        </div>
        {shoot.memo && (
          <p className="mt-2 rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: C.bgTint, color: C.textMid }}>
            {shoot.memo}
          </p>
        )}
      </div>

      {/* 素材追加フォーム */}
      <div className="rounded-2xl bg-white px-4 py-4" style={{ border: `1px solid ${C.border}` }}>
        <p className="mb-3 text-sm font-semibold" style={{ color: C.textMid }}>素材を追加</p>
        <p className="mb-3 text-xs" style={{ color: C.textFaint }}>
          ※ Vercel Blob が未設定のため、URLで登録します（実ファイルアップロードは後で対応）
        </p>
        <form onSubmit={handleAddAsset} className="space-y-3">
          <div>
            <label style={labelStyle}>タイトル *</label>
            <input
              type="text"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="商品A 正面"
              style={inputStyle}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>ファイル種別</label>
              <select
                value={addFileType}
                onChange={(e) => setAddFileType(e.target.value)}
                style={inputStyle}
              >
                <option value="photo">写真</option>
                <option value="video">動画</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>クレジット</label>
              <input
                type="number"
                min={1}
                value={addCreditCost}
                onChange={(e) => setAddCreditCost(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              <Link2 className="inline h-3 w-3 mr-1" />
              プレビューURL（任意）
            </label>
            <input
              type="url"
              value={addPreviewUrl}
              onChange={(e) => setAddPreviewUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {addError && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-rose-600"
              style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {addError}
            </div>
          )}
          {addSuccess && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm"
              style={{ backgroundColor: C.limePale, border: `1px solid ${C.limeLight}`, color: C.green }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              素材を追加しました
            </div>
          )}

          <button
            type="submit"
            disabled={addSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: C.green }}
          >
            {addSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" />追加中...</>
            ) : "素材を追加する"}
          </button>
        </form>
      </div>

      {/* 素材一覧 */}
      <div>
        <p className="mb-3 text-sm font-semibold" style={{ color: C.textMid }}>
          素材一覧（{assets.length} 件）
        </p>
        {assets.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
              <Camera className="h-6 w-6" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-3 text-sm" style={{ color: C.textMid }}>まだ素材がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => {
              const video = isVideo(asset.file_type);
              const isUpdating = updatingId === asset.id;
              return (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {/* サムネ */}
                  <div
                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                    style={{ backgroundColor: C.bgTint }}
                  >
                    {asset.preview_url ? (
                      <Image src={asset.preview_url} alt={asset.title} fill className="object-cover" unoptimized />
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
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-mono" style={{ color: C.textFaint }}>{asset.asset_no}</p>
                      <AssetStatusChip status={asset.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium" style={{ color: C.text }}>{asset.title}</p>
                    <p className="text-xs" style={{ color: C.textFaint }}>
                      {video ? "動画" : "写真"}　{asset.credit_cost} pt
                    </p>
                  </div>
                  {/* selectable ボタン */}
                  {asset.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange(asset.id, "selectable")}
                      disabled={isUpdating}
                      className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      style={{ backgroundColor: C.green }}
                    >
                      {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "公開する"}
                    </button>
                  )}
                  {asset.status === "selectable" && (
                    <button
                      onClick={() => handleStatusChange(asset.id, "draft")}
                      disabled={isUpdating}
                      className="shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
                      style={{ border: `1px solid ${C.border}`, color: C.textMuted }}
                    >
                      {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : "非公開"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
