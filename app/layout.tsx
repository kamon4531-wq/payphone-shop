import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PAY BY PA.PHONE - แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด",
  description: "เคส หัวชาร์จเร็ว ฟิล์มกระจก พาวเวอร์แบงค์ สายชาร์จ"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
