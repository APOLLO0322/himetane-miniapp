import type { Metadata } from "next";
import "@fontsource/zen-kaku-gothic-new/400.css";
import "@fontsource/zen-kaku-gothic-new/500.css";
import "@fontsource/zen-kaku-gothic-new/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ヒメタネ",
  description: "素材ライブラリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>{children}</body>
    </html>
  );
}