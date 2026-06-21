"use client";

import { useEffect } from "react";

const LINE_USER_COOKIE = "line_user_id";
const DEV_FALLBACK_USER_ID = "U_TEST_USER_001";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function LiffProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      setCookie(LINE_USER_COOKIE, DEV_FALLBACK_USER_ID);
      return;
    }

    (async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const profile = await liff.getProfile();

        // Cookieをセット
        setCookie(LINE_USER_COOKIE, profile.userId);

        // DBにユーザーを自動登録（初回）or 情報更新
        await fetch("/api/auth/line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            line_user_id: profile.userId,
            line_display_name: profile.displayName,
            picture_url: profile.pictureUrl ?? null,
          }),
        });
      } catch (err) {
        console.error("LIFF初期化エラー:", err);
        setCookie(LINE_USER_COOKIE, DEV_FALLBACK_USER_ID);
      }
    })();
  }, []);

  return <>{children}</>;
}
