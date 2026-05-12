import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heureux Shop CMS",
  description: "Heureux Shop 後台管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
