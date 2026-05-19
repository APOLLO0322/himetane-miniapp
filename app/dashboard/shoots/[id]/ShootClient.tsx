"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Camera, Video, CheckCircle2, ShoppingCart, AlertCircle, Coins,
} from "lucide-react";
import type { Asset, Shoot, Client } from "@/lib/types";

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

function AssetCard({
  asset,
  selected,
  onToggle,
}: {
  asset: Asset;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const video = isVideo(asset.file_type);
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all cursor-pointer"
      style={{
        border: selected ? `2px solid ${C.green}` : `1px solid ${C.border}`,
        boxShadow: selected ? `0 0 0 3px ${C.limePale}` : undefined,
      }}
      onClick={() => onToggle(asset.id)}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ backgroundColor: C.bgTint }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {asset.preview_url ? (
          <Image src={asset.preview_url} alt={asset.title} fill className="object-cover pointer-events-none select-none" draggable={false} unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {video
              ? <Video className="h-8 w-8" style={{ color: C.textFaint }} />
              : <Camera className="h-8 w-8" style={{ color: C.textFaint }} />}
          </div>
        )}
        {/* Credit badge */}
        <div
          className="absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold backdrop-blur-sm"
          style={
            video
              ? { backgroundColor: "rgba(254,249,194,0.9)", color: "#874b00" }
              : { backgroundColor: "rgba(212,232,160,0.9)", color: C.green }
          }
        >
          {video ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
          {asset.credit_cost}pt
        </div>
        {/* Checkbox */}
        <div className="absolute left-2 top-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors"
            style={
              selected
                ? { backgroundColor: C.green, borderColor: C.green }
                : { backgroundColor: "white", borderColor: C.border }
            }
          >
            {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
          </div>
        </div>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[10px] font-mono leading-none" style={{ color: C.textFaint }}>{asset.asset_no}</p>
        <p className="mt-0.5 line-clamp-1 text-xs font-medium" style={{ color: C.textMid }}>{asset.title}</p>
      </div>
    </div>
  );
}

type Props = {
  shoot: Shoot;
  assets: Asset[];
  client: Client;
};

export default function ShootClient({ shoot, assets, client }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const totalCredit = assets
    .filter((a) => selectedIds.has(a.id))
    .reduce((sum, a) => sum + a.credit_cost, 0);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
          asset_ids: Array.from(selectedIds),
          shoot_id: shoot.id,
          message: message.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setShowSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: C.bgWarm }}>
        <div className="w-full max-w-sm rounded-3xl bg-white p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: C.limePale }}>
            <CheckCircle2 className="h-10 w-10" style={{ color: C.green }} />
          </div>
          <p className="mt-5 text-lg font-bold" style={{ color: C.text }}>リクエストを送信しました</p>
          <p className="mt-1 text-sm" style={{ color: C.textMuted }}>担当者が確認後、素材をお届けします</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/requests">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white"
                style={{ backgroundColor: C.green }}
              >
                リクエスト履歴を見る
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="rounded-xl py-3 text-sm font-medium" style={{ color: C.textMid }}>
                ダッシュボードに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold" style={{ color: C.text }}>{shoot.title}</p>
            <p className="text-xs" style={{ color: C.textFaint }}>
              {shoot.shoot_date
                ? new Date(shoot.shoot_date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
                : "日付未設定"}
            </p>
          </div>
        </div>
      </header>

      {/* 素材グリッド */}
      <div className="px-4 pt-4">
        <p className="mb-3 text-xs" style={{ color: C.textMuted }}>
          {assets.length} 件の素材
          {selectedIds.size > 0 && (
            <span style={{ color: C.green }}>　{selectedIds.size} 件選択中</span>
          )}
        </p>

        {assets.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
              <Camera className="h-7 w-7" style={{ color: C.textFaint }} />
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color: C.textMid }}>
              この撮影に選択可能な素材がありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {assets.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                selected={selectedIds.has(a.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* ボトムバー */}
      {assets.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-3"
          style={{ backgroundColor: "white", borderTop: `1px solid ${C.border}`, boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
        >
          {selectedIds.size > 0 && (
            <div className="mb-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="担当者へのメッセージ（任意）"
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                style={{ borderColor: C.border, color: C.text }}
              />
            </div>
          )}
          {submitError && (
            <div className="mb-2 flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {submitError}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedIds.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: C.green }}
          >
            {submitting ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />送信中...</>
            ) : selectedIds.size > 0 ? (
              <>
                <ShoppingCart className="h-5 w-5" />
                {selectedIds.size} 件をリクエスト
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-sm">
                  <Coins className="h-3.5 w-3.5" />
                  {totalCredit} pt
                </span>
              </>
            ) : "素材を選択してください"}
          </button>
        </div>
      )}
    </div>
  );
}
