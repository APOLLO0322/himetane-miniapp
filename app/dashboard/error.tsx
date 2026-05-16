"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const C = {
  green: "#007956",
  text: "#292524",
  textMuted: "#79716b",
  bgWarm: "#fafaf9",
};

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ backgroundColor: C.bgWarm }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
        <AlertTriangle className="h-7 w-7 text-rose-500" />
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: C.text }}>
          データの読み込みに失敗しました
        </p>
        <p className="mt-1 text-sm" style={{ color: C.textMuted }}>
          通信環境を確認してもう一度お試しください
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
        style={{ backgroundColor: C.green }}
      >
        <RefreshCw className="h-4 w-4" />
        再読み込み
      </button>
    </div>
  );
}
