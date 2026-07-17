"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const saved = localStorage.getItem("selectedBranch") || "";
    const code = saved.split(":")[0].trim();
    const url = code
      ? `https://payphone-web-live.vercel.app/?branch=${encodeURIComponent(code)}`
      : "https://payphone-web-live.vercel.app/";
    window.location.replace(url);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <p>🛒 กำลังพาไปหน้าร้าน...</p>
    </div>
  );
}
