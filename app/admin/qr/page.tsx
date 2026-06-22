"use client";
import { useEffect, useRef, useState } from "react";
import { BRANCHES } from "@/lib/types";

const SITE = "https://payphone-shop.vercel.app";

function QRCard({ code, name, region }: { code: string; name: string; region: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = `${SITE}/branch/${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&ecc=H&data=${encodeURIComponent(url)}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // กล่องสีขาวตรงกลาง
      const boxSize = img.width * 0.16;
      const boxX = (img.width - boxSize) / 2;
      const boxY = (img.height - boxSize) / 2;
      ctx.fillStyle = "white";
      ctx.fillRect(boxX, boxY, boxSize, boxSize);

      // ขอบสีเขียว
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
      ctx.strokeRect(boxX, boxY, boxSize, boxSize);

      // ตัวอักษร
      ctx.fillStyle = "#065f46";
      ctx.font = `bold ${boxSize * 0.42}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(code, img.width / 2, img.height / 2);
    };
    img.onerror = () => {
      // fallback ถ้า CORS error
      ctx.fillStyle = "#ef4444";
      ctx.font = "20px Arial";
      ctx.fillText("QR load failed", 100, 100);
    };
    img.src = qrUrl;
  }, [qrUrl, code]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `QR-${code}.png`;
      a.click();
    } catch (e) {
      alert("ดาวน์โหลดล้มเหลว — ลองคลิกขวาที่รูป → Save image");
    }
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow text-center">
      <canvas ref={canvasRef} className="w-full aspect-square"/>
      <div className="text-xs font-bold text-emerald-700 mt-2">{region}</div>
      <div className="text-xs mb-2 line-clamp-2 min-h-[2rem]">{name}</div>
      <button onClick={download}
        className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded">
        📥 ดาวน์โหลด
      </button>
      <div className="text-[10px] text-gray-400 mt-1 break-all">{url}</div>
    </div>
  );
}

export default function QRPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { fetch("/api/admin/me").then(r => setAuthed(r.ok)); }, []);

  if (authed === null) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="mb-3">กรุณาเข้าสู่ระบบก่อน</p>
        <a href="/admin" className="text-emerald-500 underline">ไปหน้า Admin</a>
      </div>
    </div>
  );

  const regions = ["all", "R1", "R2", "R3", "R4"];
  const filtered = filter === "all" ? BRANCHES : BRANCHES.filter(b => b.region === filter);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">QR Code สำหรับแต่ละสาขา</h1>
        <a href="/admin" className="text-sm text-gray-600 hover:underline">← Admin</a>
      </header>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm text-gray-700">
        💡 พิมพ์ QR ติดที่ร้าน → ลูกค้าสแกน → เข้าหน้าสาขา → กดเพิ่มเพื่อน Line + สมัครสมาชิก (ระบบนับให้)
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {regions.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              filter === r ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? `ทั้งหมด (${BRANCHES.length})` : `${r} (${BRANCHES.filter(b => b.region === r).length})`}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(b => {
          const code = b.name.split(":")[0];
          return <QRCard key={code} code={code} name={b.name} region={b.region}/>;
        })}
      </div>
    </div>
  );
}
