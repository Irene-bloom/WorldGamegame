import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小径分岔的花园",
  description:
    "时间不是一条直线，而是一张分岔的网。在并存的时间线之间侧耳倾听，找到通往中心的那一条路。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
