"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ShoppingCart,
  FolderOpen,
  Clock,
  CheckCircle,
  Package,
} from "lucide-react";
import type { Client, Shoot, CreditTransaction, User, AssetRequest } from "@/lib/types";

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

// 撮影フォルダカード（リンク版）
function ShootFolderCard({ shoot }: { shoot: Shoot }) {
  return (
    <Link href={`/dashboard/shoots/${shoot.id}`}>
      <div
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
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: C.textFaint }} />
      </div>
    </Link>
  );
}

// リクエストステータスチップ
function RequestStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    pending:   { label: "確認待ち", icon: <Clock className="h-3 w-3" />,        color: "#92400e", bg: "#fef3c7" },
    approved:  { label: "承認済み", icon: <CheckCircle className="h-3 w-3" />,  color: C.green,   bg: C.limePale },
    delivered: { label: "納品済み", icon: <Package className="h-3 w-3" />,      color: "#1d4ed8", bg: "#eff6ff" },
  };
  const s = map[status] ?? { label: status, icon: null, color: C.textMuted, bg: C.bgTint };
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// メイン Client Component
export default function DashboardClient({
  currentUser,
  client,
  shoots,
  transactions,
  recentRequests,
}: {
  currentUser: User;
  client: Client;
  shoots: Shoot[];
  transactions: CreditTransaction[];
  recentRequests: AssetRequest[];
}) {
  // クレジット計算
  const granted = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const used = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: C.bgWarm }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-10 px-4 py-3 backdrop-blur-sm"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: "rgba(250,250,249,0.85)" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight" style={{ color: C.green }}>ヒメタネ</h1>
          <Link
            href="/dashboard/requests"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
            style={{ color: C.textMuted }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            履歴
          </Link>
        </div>
      </header>

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
              <ShootFolderCard key={shoot.id} shoot={shoot} />
            ))}
          </div>
        )}
      </div>

      {/* 最近のリクエスト */}
      {recentRequests.length > 0 && (
        <div className="mt-6 px-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold" style={{ color: C.textMid }}>
              <ShoppingCart className="mb-0.5 mr-1.5 inline h-4 w-4" style={{ color: C.green }} />
              最近のリクエスト
            </p>
            <Link href="/dashboard/requests" className="text-xs" style={{ color: C.green }}>
              すべて見る
            </Link>
          </div>
          <div className="space-y-2">
            {recentRequests.map((req) => (
              <Link key={req.id} href={`/dashboard/requests/${req.id}`}>
                <div
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div>
                    <p className="text-xs font-mono" style={{ color: C.textFaint }}>
                      {new Date(req.created_at).toLocaleDateString("ja-JP", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: C.text }}>
                      {req.total_credit} pt
                    </p>
                  </div>
                  <RequestStatusChip status={req.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
