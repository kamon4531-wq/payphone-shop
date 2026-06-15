import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PAY BY PA.PHONE - แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด",
  description: "เคส หัวชาร์จเร็ว ฟิล์มกระจก พาวเวอร์แบงค์ สายชาร์จ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PA.PHONE",
    statusBarStyle: "default"
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#10b981"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
