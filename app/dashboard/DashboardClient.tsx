"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Video,
  Coins,
  X,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Asset, Client, Shoot, CreditTransaction, User } from "@/lib/types";

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

function isVideo(fileType: string) {
  return fileType.startsWith("video") || fileType === "video";
}

// クレジットカード
function CreditCard({ balance, granted, used }: { balance: number; granted: number; used: number }) {
  const total = granted || 1;
  const pct = Math.min(100, Math.round((Math.abs(used) / total) * 100));
  return (
    <div
      className="mx-4 rounded-2xl p-5 text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDeep} 100%)` }}
    >
      <p className="text-xs font-medium tracking-widest uppercase" style={{ color: C.limeLight }}>
        クレジット残高
      </p>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-5xl font-bold">{balance}</span>
        <span className="mb-1 text-lg" style={{ color: C.limeLight }}>pt</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${C.greenDark}99` }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: C.lime }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs" style={{ color: C.limeLight }}>
        <span>付与 {granted} pt</span>
        <span>使用済み {Math.abs(used)} pt</span>
      </div>
    </div>
  );
}

// 撮影フォルダカード
function ShootFolderCard({
  shoot,
  assetCount,
  onClick,
}: {
  shoot: Shoot;
  assetCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left transition-shadow hover:shadow-md active:scale-[0.99]"
      style={{ border: `1px solid ${C.border}` }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: C.limePale }}
      >
        <FolderOpen className="h-5 w-5" style={{ color: C.green }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: C.text }}>
          {shoot.title}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>
          {shoot.shoot_date
            ? new Date(shoot.shoot_date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "日付未設定"}
          　·　素材 {assetCount} 件
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textFaint }} />
    </button>
  );
}

// 素材バッジ
function FileTypeBadge({ fileType }: { fileType: string }) {
  const video = isVideo(fileType);
  return (
    <Badge
      className="gap-1 hover:opacity-90"
      style={
        video
          ? { backgroundColor: "#fef9c2", color: "#874b00", border: "none" }
          : { backgroundColor: C.limeLight, color: C.green, border: "none" }
      }
    >
      {video ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
      {video ? "動画" : "写真"}
    </Badge>
  );
}

// 素材カード（選択モード対応）
function AssetCard({
  asset,
  selectMode,
  selected,
  onToggle,
}: {
  asset: Asset;
  selectMode: boolean;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const video = isVideo(asset.file_type);
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all"
      style={{
        border: selected ? `2px solid ${C.green}` : `1px solid ${C.border}`,
        boxShadow: selected ? `0 0 0 3px ${C.limePale}` : undefined,
      }}
      onClick={() => selectMode && onToggle(asset.id)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ backgroundColor: C.bgTint }}>
        {asset.preview_url ? (
          <Image src={asset.preview_url} alt={asset.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {video ? (
              <Video className="h-8 w-8" style={{ color: C.textFaint }} />
            ) : (
              <Camera className="h-8 w-8" style={{ color: C.textFaint }} />
            )}
          </div>
        )}
        {video && asset.preview_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Video className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <FileTypeBadge fileType={asset.file_type} />
        </div>
        {selectMode && (
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
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-mono" style={{ color: C.textFaint }}>{asset.asset_no}</p>
        <p className="mt-0.5 line-clamp-1 text-sm font-medium" style={{ color: C.text }}>{asset.title}</p>
        <div className="mt-2 flex items-center justify-end">
          <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ backgroundColor: C.limePale }}>
            <Coins className="h-3 w-3" style={{ color: C.lime }} />
            <span className="text-xs font-medium" style={{ color: C.green }}>{asset.credit_cost} pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// リクエスト確認シート
function RequestSheet({
  assets,
  selectedIds,
  balance,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  assets: Asset[];
  selectedIds: Set<string>;
  balance: number;
  onClose: () => void;
  onSubmit: (message: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [message, setMessage] = useState("");
  const selectedAssets = assets.filter((a) => selectedIds.has(a.id));
  const totalCredit = selectedAssets.reduce((sum, a) => sum + a.credit_cost, 0);
  const shortage = totalCredit > balance;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="flex-1" onClick={onClose} />
      <div className="rounded-t-3xl bg-white px-5 pb-10 pt-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: C.border }} />
        <h2 className="text-base font-bold" style={{ color: C.text }}>素材リクエスト確認</h2>
        <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>選択した素材のダウンロードをリクエストします</p>

        <div className="mt-4 space-y-2">
          {selectedAssets.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: C.bgTint }}>
              <div>
                <p className="text-sm font-medium" style={{ color: C.text }}>{a.title}</p>
                <p className="text-xs" style={{ color: C.textFaint }}>{a.asset_no}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: C.limePale, color: C.green }}>
                <Coins className="h-3 w-3" style={{ color: C.lime }} />
                {a.credit_cost} pt
              </span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: shortage ? "#fff1f2" : C.limePale, border: `1px solid ${shortage ? "#fecdd3" : C.limeLight}` }}
        >
          <span className="text-sm font-medium" style={{ color: C.textMid }}>合計</span>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: shortage ? "#e11d48" : C.textMuted }}>残高 {balance} pt</span>
            <span className="text-lg font-bold" style={{ color: shortage ? "#e11d48" : C.green }}>{totalCredit} pt</span>
          </div>
        </div>
        {shortage && (
          <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
            <AlertCircle className="h-3 w-3" />
            クレジットが不足しています（不足: {totalCredit - balance} pt）
          </p>
        )}

        <div className="mt-4">
          <label className="text-xs font-medium" style={{ color: C.textMid }}>メモ（任意）</label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="担当者へのメッセージ..."
            className="mt-1.5 rounded-xl bg-white text-sm"
            style={{ borderColor: C.border }}
          />
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border py-3 text-sm font-medium" style={{ borderColor: C.border, color: C.textMid }}>
            キャンセル
          </button>
          <button
            onClick={() => onSubmit(message)}
            disabled={submitting || shortage}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: C.green }}
          >
            {submitting ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />送信中...</>
            ) : "リクエスト送信"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 成功画面
function SuccessOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: C.limePale }}>
          <CheckCircle2 className="h-10 w-10" style={{ color: C.green }} />
        </div>
        <p className="mt-5 text-lg font-bold" style={{ color: C.text }}>リクエストを送信しました</p>
        <p className="mt-1 text-sm" style={{ color: C.textMuted }}>担当者が確認後、素材をお届けします</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/dashboard/requests">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white" style={{ backgroundColor: C.green }}>
              リクエスト履歴を見る
              <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
          <button onClick={onClose} className="rounded-xl py-3 text-sm font-medium" style={{ color: C.textMid }}>
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// メイン Client Component
export default function DashboardClient({
  currentUser,
  client,
  assets,
  shoots,
  transactions,
}: {
  currentUser: User;
  client: Client;
  assets: Asset[];
  shoots: Shoot[];
  transactions: CreditTransaction[];
}) {
  // 選択フォルダ (null = フォルダ一覧, shoot.id = 素材一覧)
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const selectedShoot = shoots.find((s) => s.id === selectedShootId) ?? null;

  // 選択モード
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // シート/モーダル状態
  const [showSheet, setShowSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // クレジット計算
  const granted = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const used = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 撮影ごとの素材数
  const assetCountByShoot = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assets) {
      if (a.shoot_id) map.set(a.shoot_id, (map.get(a.shoot_id) ?? 0) + 1);
    }
    return map;
  }, [assets]);

  // 現在のフォルダの素材
  const folderAssets = useMemo(() => {
    if (!selectedShootId) return [];
    return assets.filter((a) => a.shoot_id === selectedShootId);
  }, [assets, selectedShootId]);

  // 検索クエリ（素材ビュー内）
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return folderAssets;
    const q = searchQuery.trim().toLowerCase();
    return folderAssets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.asset_no.toLowerCase().includes(q) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [folderAssets, searchQuery]);

  function openFolder(shootId: string) {
    setSelectedShootId(shootId);
    setSelectMode(false);
    setSelectedIds(new Set());
    setSearchQuery("");
  }

  function backToFolders() {
    setSelectedShootId(null);
    setSelectMode(false);
    setSelectedIds(new Set());
    setSearchQuery("");
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  async function handleSubmitRequest(message: string) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id, asset_ids: Array.from(selectedIds), message: message || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "エラーが発生しました");
      setShowSheet(false);
      setShowSuccess(true);
      exitSelectMode();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bgWarm, paddingBottom: selectMode ? "5rem" : "4rem" }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}
      >
        <div className="flex items-center gap-3">
          {selectedShootId ? (
            <button
              onClick={backToFolders}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
              style={{ color: C.textFaint }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <h1 className="text-base font-bold tracking-tight" style={{ color: C.green }}>ヒメタネ</h1>
          )}

          <div className="flex flex-1 items-center justify-between">
            {selectedShootId ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold" style={{ color: C.text }}>{selectedShoot?.title}</p>
                <p className="text-xs" style={{ color: C.textFaint }}>
                  {selectedShoot?.shoot_date
                    ? new Date(selectedShoot.shoot_date).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })
                    : "日付未設定"}
                </p>
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/requests" className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs" style={{ color: C.textMuted }}>
                <ShoppingCart className="h-3.5 w-3.5" />
                履歴
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== フォルダ一覧ビュー ===== */}
      {!selectedShootId && (
        <>
          {/* 挨拶 */}
          <div className="px-4 pb-1 pt-5">
            <p className="text-xs" style={{ color: C.textMuted }}>こんにちは</p>
            <p className="text-xl font-bold" style={{ color: C.text }}>
              {currentUser.display_name ?? client.name}
              <span className="font-normal">さん</span>
            </p>
            <p className="mt-0.5 text-xs" style={{ color: C.textFaint }}>{client.name}</p>
          </div>

          {/* クレジットカード */}
          <div className="mt-3">
            <CreditCard balance={balance} granted={granted} used={used} />
          </div>

          {/* 撮影フォルダ一覧 */}
          <div className="mt-6 px-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: C.textMid }}>
                <CalendarDays className="mb-0.5 mr-1.5 inline h-4 w-4" style={{ color: C.green }} />
                撮影フォルダ
              </p>
            </div>

            {shoots.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
                  <FolderOpen className="h-7 w-7" style={{ color: C.textFaint }} />
                </div>
                <p className="mt-3 text-sm font-medium" style={{ color: C.textMid }}>撮影データがありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shoots.map((shoot) => (
                  <ShootFolderCard
                    key={shoot.id}
                    shoot={shoot}
                    assetCount={assetCountByShoot.get(shoot.id) ?? 0}
                    onClick={() => openFolder(shoot.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== 素材一覧ビュー ===== */}
      {selectedShootId && (
        <div className="pt-4">
          {/* 選択モードバー */}
          <div className="px-4">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: C.textFaint }}>
                {filteredAssets.length} 件の素材
                {selectMode && selectedIds.size > 0 && (
                  <span style={{ color: C.green }}>　{selectedIds.size} 件選択中</span>
                )}
              </p>
              {!selectMode ? (
                <button
                  onClick={() => { setSelectMode(true); setSelectedIds(new Set()); }}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: C.green }}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  素材を選ぶ
                </button>
              ) : (
                <button
                  onClick={exitSelectMode}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{ color: C.textMuted, border: `1px solid ${C.border}` }}
                >
                  キャンセル
                </button>
              )}
            </div>

            {selectMode && (
              <p className="mt-1 text-xs" style={{ color: C.textMuted }}>
                リクエストしたい素材をタップして選択してください
              </p>
            )}

            {/* 検索 */}
            <div className="relative mt-3">
              <Camera className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.textFaint }} />
              <input
                type="text"
                placeholder="タイトル・番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border bg-white py-2 pl-9 pr-9 text-sm focus:outline-none"
                style={{ borderColor: C.border, color: C.text }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textFaint }}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* 素材グリッド */}
          <div className="mt-3 grid grid-cols-2 gap-3 px-4 sm:grid-cols-3">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((a) => (
                <AssetCard
                  key={a.id}
                  asset={a}
                  selectMode={selectMode}
                  selected={selectedIds.has(a.id)}
                  onToggle={toggleSelect}
                />
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center py-16 text-center sm:col-span-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: C.bgTint }}>
                  <Camera className="h-7 w-7" style={{ color: C.textFaint }} />
                </div>
                <p className="mt-3 text-sm font-medium" style={{ color: C.textMid }}>
                  {searchQuery ? "素材が見つかりません" : "この撮影に素材がありません"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 選択モード ボトムバー */}
      {selectMode && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-8 pt-3"
          style={{ backgroundColor: "white", borderTop: `1px solid ${C.border}`, boxShadow: "0 -4px 16px rgba(0,0,0,0.08)" }}
        >
          <button
            onClick={() => { setSubmitError(null); setShowSheet(true); }}
            disabled={selectedIds.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: C.green }}
          >
            <ShoppingCart className="h-5 w-5" />
            {selectedIds.size > 0 ? `${selectedIds.size} 件をリクエスト` : "素材を選択してください"}
          </button>
        </div>
      )}

      {/* 確認シート */}
      {showSheet && (
        <RequestSheet
          assets={assets}
          selectedIds={selectedIds}
          balance={balance}
          onClose={() => setShowSheet(false)}
          onSubmit={handleSubmitRequest}
          submitting={submitting}
          error={submitError}
        />
      )}

      {/* 成功オーバーレイ */}
      {showSuccess && <SuccessOverlay onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
