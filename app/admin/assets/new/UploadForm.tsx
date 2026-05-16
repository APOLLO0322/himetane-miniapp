"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  Video,
  CheckCircle2,
  AlertCircle,
  X,
  FileImage,
  FileVideo,
  Loader2,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Client, Shoot } from "@/lib/types";

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

// ── 型定義 ────────────────────────────────────────
type FileItemStatus = "pending" | "uploading" | "done" | "error";

type FileItem = {
  localId: string;
  file: File;
  title: string;
  assetNo: string;
  fileType: "photo" | "video";
  status: FileItemStatus;
  errorMsg?: string;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "下書き" },
  { value: "published", label: "公開" },
  { value: "archived", label: "アーカイブ" },
];

const CREDIT_OPTIONS = [1, 2, 3, 4, 5];

// ── ファイル種別推定 ──────────────────────────────
function detectFileType(file: File): "photo" | "video" {
  return file.type.startsWith("video/") ? "video" : "photo";
}

// ── ローカルID生成 ────────────────────────────────
let _idCounter = 0;
function newId() {
  return `f-${Date.now()}-${++_idCounter}`;
}

// ── ファイルサイズ表示 ────────────────────────────
function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── ステータスアイコン ────────────────────────────
function StatusIcon({ status }: { status: FileItemStatus }) {
  if (status === "done")
    return <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C.green }} />;
  if (status === "uploading")
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: C.lime }} />;
  if (status === "error")
    return <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />;
  return null;
}

// ── 共通ラベル行 ──────────────────────────────────
function FieldRow({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium" style={{ color: C.textMid }}>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs" style={{ color: C.textFaint }}>{hint}</p>}
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────
export default function UploadForm({
  clients,
  allShoots,
}: {
  clients: Client[];
  allShoots: Shoot[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 共通フィールド
  const [clientId, setClientId] = useState("");
  const [shootId, setShootId] = useState("none");
  const [creditCost, setCreditCost] = useState(1);
  const [status, setStatus] = useState("draft");

  // ファイルリスト
  const [items, setItems] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const filteredShoots = allShoots.filter((s) => s.client_id === clientId);

  // ── ファイル追加 ──────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    setItems((prev) => [
      ...prev,
      ...arr.map((f) => ({
        localId: newId(),
        file: f,
        title: f.name.replace(/\.[^.]+$/, ""), // 拡張子除いてタイトルに
        assetNo: "",
        fileType: detectFileType(f),
        status: "pending" as FileItemStatus,
      })),
    ]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = ""; // 同じファイルを再選択できるようリセット
  };

  // ── アイテム更新ヘルパー ──────────────────────
  const updateItem = (localId: string, patch: Partial<FileItem>) =>
    setItems((prev) =>
      prev.map((it) => (it.localId === localId ? { ...it, ...patch } : it))
    );

  const removeItem = (localId: string) =>
    setItems((prev) => prev.filter((it) => it.localId !== localId));

  // ── 1ファイルアップロード ─────────────────────
  const uploadOne = async (item: FileItem): Promise<boolean> => {
    updateItem(item.localId, { status: "uploading" });

    try {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("client_id", clientId);
      fd.append("shoot_id", shootId === "none" ? "" : shootId);
      fd.append("asset_no", item.assetNo || item.localId);
      fd.append("title", item.title);
      fd.append("file_type", item.fileType);
      fd.append("credit_cost", String(creditCost));
      fd.append("status", status);

      const res = await fetch("/api/assets/upload", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || json.error) {
        updateItem(item.localId, { status: "error", errorMsg: json.error });
        return false;
      }

      updateItem(item.localId, { status: "done" });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ネットワークエラー";
      updateItem(item.localId, { status: "error", errorMsg: msg });
      return false;
    }
  };

  // ── 全ファイル逐次アップロード ────────────────
  const handleUploadAll = async () => {
    if (!clientId) return;
    const targets = items.filter((it) => it.status === "pending" || it.status === "error");
    if (targets.length === 0) return;

    setIsUploading(true);
    for (const item of targets) {
      await uploadOne(item);
    }
    setIsUploading(false);
  };

  // ── 集計 ─────────────────────────────────────
  const pendingCount = items.filter((it) => it.status === "pending").length;
  const errorCount = items.filter((it) => it.status === "error").length;
  const doneCount = items.filter((it) => it.status === "done").length;
  const retryTargets = errorCount; // エラーのみ再試行
  const allDone = items.length > 0 && doneCount === items.length;
  const canUpload = !!clientId && (pendingCount > 0 || retryTargets > 0) && !isUploading;

  return (
    <div className="space-y-6 px-4 pb-16 pt-6">

      {/* ── 共通設定 ─────────────────────────── */}
      <section
        className="space-y-4 rounded-2xl p-4"
        style={{ backgroundColor: "white", border: `1px solid ${C.border}` }}
      >
        <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.textFaint }}>
          共通設定
        </p>

        {/* 顧客 */}
        <FieldRow label="顧客" required>
          <Select
            value={clientId}
            onValueChange={(v) => { setClientId(v); setShootId("none"); }}
          >
            <SelectTrigger className="rounded-xl bg-white" style={{ borderColor: C.border }}>
              <SelectValue placeholder="顧客を選んでください" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        {/* 撮影回 */}
        <FieldRow label="撮影回" hint="任意">
          <Select
            value={shootId}
            onValueChange={setShootId}
            disabled={!clientId || filteredShoots.length === 0}
          >
            <SelectTrigger className="rounded-xl bg-white" style={{ borderColor: C.border }}>
              <SelectValue placeholder={
                !clientId ? "先に顧客を選んでください"
                  : filteredShoots.length === 0 ? "撮影データがありません"
                    : "撮影回を選んでください"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">指定なし</SelectItem>
              {filteredShoots.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                  {s.shoot_date && ` (${new Date(s.shoot_date).toLocaleDateString("ja-JP")})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>

        {/* 消費クレジット */}
        <FieldRow label="消費クレジット（1ファイルあたり）">
          <div className="flex items-center gap-2">
            {CREDIT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCreditCost(n)}
                className="h-9 w-9 rounded-xl border text-sm font-semibold transition-colors"
                style={
                  creditCost === n
                    ? { borderColor: C.lime, backgroundColor: C.limePale, color: C.green }
                    : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                }
              >
                {n}
              </button>
            ))}
            <span className="text-xs" style={{ color: C.textFaint }}>pt</span>
          </div>
        </FieldRow>

        {/* ステータス */}
        <FieldRow label="ステータス">
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className="flex-1 rounded-xl border py-2 text-xs font-medium transition-colors"
                style={
                  status === opt.value
                    ? { borderColor: C.green, backgroundColor: C.limePale, color: C.green }
                    : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldRow>
      </section>

      {/* ── ドロップゾーン ────────────────────── */}
      <div
        className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors"
        style={{
          borderColor: dragOver ? C.green : C.border,
          backgroundColor: dragOver ? C.limePale : "white",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onFileInput}
        />
        <div className="flex flex-col items-center gap-2 py-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: C.limePale }}
          >
            <Plus className="h-6 w-6" style={{ color: C.green }} />
          </div>
          <p className="text-sm font-medium" style={{ color: C.textMid }}>
            タップまたはドラッグ＆ドロップ
          </p>
          <p className="text-xs" style={{ color: C.textFaint }}>
            画像・動画を複数同時に選択できます
          </p>
        </div>
      </div>

      {/* ── ファイルリスト ────────────────────── */}
      {items.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: C.textMid }}>
              選択ファイル（{items.length}件）
            </p>
            {doneCount > 0 && (
              <p className="text-xs" style={{ color: C.green }}>
                {doneCount}/{items.length} 完了
              </p>
            )}
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.localId}
                className="rounded-2xl bg-white p-3"
                style={{
                  border: `1px solid ${
                    item.status === "done" ? C.limeLight
                      : item.status === "error" ? "#fecdd3"
                        : C.border
                  }`,
                }}
              >
                {/* ファイル情報行 */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: C.limePale }}
                  >
                    {item.fileType === "video"
                      ? <FileVideo className="h-4 w-4" style={{ color: C.green }} />
                      : <FileImage className="h-4 w-4" style={{ color: C.green }} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium" style={{ color: C.textMid }}>
                      {item.file.name}
                    </p>
                    <p className="text-xs" style={{ color: C.textFaint }}>
                      {formatSize(item.file.size)}
                    </p>
                  </div>
                  <StatusIcon status={item.status} />
                  {item.status !== "uploading" && item.status !== "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.localId)}
                      className="shrink-0 rounded-lg p-1 hover:bg-stone-100"
                      style={{ color: C.textFaint }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* エラーメッセージ */}
                {item.status === "error" && item.errorMsg && (
                  <p className="mt-1.5 text-xs text-rose-500">{item.errorMsg}</p>
                )}

                {/* 編集フィールド（pending / error のみ表示） */}
                {(item.status === "pending" || item.status === "error") && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* 素材番号 */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium" style={{ color: C.textFaint }}>
                        素材番号
                      </p>
                      <Input
                        value={item.assetNo}
                        onChange={(e) => updateItem(item.localId, { assetNo: e.target.value })}
                        placeholder="A-001"
                        className="h-8 rounded-lg bg-white font-mono text-xs"
                        style={{ borderColor: C.border }}
                      />
                    </div>

                    {/* 種別 */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium" style={{ color: C.textFaint }}>
                        種別
                      </p>
                      <div className="flex h-8 gap-1">
                        {(["photo", "video"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateItem(item.localId, { fileType: t })}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-colors"
                            style={
                              item.fileType === t
                                ? { borderColor: C.green, backgroundColor: C.limePale, color: C.green }
                                : { borderColor: C.border, backgroundColor: "white", color: C.textMuted }
                            }
                          >
                            {t === "photo" ? <Camera className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                            {t === "photo" ? "写真" : "動画"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* タイトル（2カラム全幅） */}
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs font-medium" style={{ color: C.textFaint }}>
                        タイトル
                      </p>
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(item.localId, { title: e.target.value })}
                        placeholder="タイトルを入力"
                        className="h-8 rounded-lg bg-white text-xs"
                        style={{ borderColor: C.border }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 全完了バナー ──────────────────────── */}
      {allDone && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{ backgroundColor: C.limePale, border: `1px solid ${C.limeLight}` }}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: C.green }} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: C.green }}>
              すべてのアップロードが完了しました
            </p>
            <p className="text-xs" style={{ color: C.textMuted }}>
              {doneCount}件の素材を登録しました
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: C.green }}
          >
            ダッシュボードへ
          </button>
        </div>
      )}

      {/* ── アップロードボタン ────────────────── */}
      {items.length > 0 && !allDone && (
        <button
          type="button"
          disabled={!canUpload}
          onClick={handleUploadAll}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: C.green }}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              アップロード中...（{doneCount}/{items.length}）
            </>
          ) : retryTargets > 0 && pendingCount === 0 ? (
            <>
              <Upload className="h-4 w-4" />
              エラー分を再試行（{retryTargets}件）
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {items.length}件をまとめてアップロード
            </>
          )}
        </button>
      )}
    </div>
  );
}
