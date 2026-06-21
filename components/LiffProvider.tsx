"use client";

import { useEffect } from "react";
import { initLiff, liff } from "@/lib/liff";

const LINE_USER_COOKIE = "line_user_id";

/** LIFF IDを設定するまでの間、開発用フォールバックIDを使う */
const DEV_FALLBACK_USER_ID = "U_TEST_USER_001";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    // LIFF IDが未設定 → 開発用フォールバック
    if (!liffId) {
      setCookie(LINE_USER_COOKIE, DEV_FALLBACK_USER_ID);
      return;
    }

    initLiff()
      .then(async () => {
        // LINEアプリ外からアクセスした場合はLINEログインへリダイレクト
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const profile = await liff.getProfile();
        setCookie(LINE_USER_COOKIE, profile.userId);
      })
      .catch((err) => {
        console.error("LIFF初期化エラー:", err);
        // エラー時は開発用フォールバック（本番では適切なエラー画面を表示すること）
        setCookie(LINE_USER_COOKIE, DEV_FALLBACK_USER_ID);
      });
  }, []);

  return <>{children}</>;
}
