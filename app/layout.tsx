import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku",
  display: "swap",
});

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
    <html lang="ja" className={zenKaku.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}