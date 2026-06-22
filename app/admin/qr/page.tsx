"use client";
import { useEffect, useRef, useState } from "react";
import { BRANCHES } from "@/lib/types";

const SITE = "https://payphone-shop.vercel.app";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
}

function drawQRWithCode(canvas: HTMLCanvasElement, img: HTMLImageElement, code: string) {
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, 0, 0);
  const boxSize = img.width * 0.16;
  const boxX = (img.width - boxSize) / 2;
  const boxY = (img.height - boxSize) / 2;
  ctx.fillStyle = "white";
  ctx.fillRect(boxX, boxY, boxSize, boxSize);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4;
  ctx.strokeRect(boxX, boxY, boxSize, boxSize);
  ctx.fillStyle = "#065f46";
  ctx.font = `bold ${boxSize * 0.42}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(code, img.width / 2, img.height / 2);
}

async function generateQRBlob(code: string): Promise<Blob | null> {
  return new Promise(resolve => {
    const url = `${SITE}/branch/${code}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&ecc=H&data=${encodeURIComponent(url)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      drawQRWithCode(canvas, img, code);
      canvas.toBlob(b => resolve(b), "image/png");
    };
    img.onerror = () => resolve(null);
    img.src = qrUrl;
  });
}

function QRCard({ code, name, region }: { code: string; name: string; region: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = `${SITE}/branch/${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=10&ecc=H&data=${encodeURIComponent(url)}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawQRWithCode(canvas, img, code);
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
    } catch {
      alert("คลิกขวาที่รูป → Save image");
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
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  useEffect(() => { fetch("/api/admin/me").then(r => setAuthed(r.ok)); }, []);

  const regions = ["all", "R1", "R2", "R3", "R4"];
  const filtered = filter === "all" ? BRANCHES : BRANCHES.filter(b => b.region === filter);

  async function downloadAll() {
    setBulkLoading(true);
    setBulkProgress({ done: 0, total: filtered.length });
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js");
      const JSZipLib = (window as any).JSZip;
      const zip = new JSZipLib();
      let done = 0;
      for (const b of filtered) {
        const code = b.name.split(":")[0];
        const blob = await generateQRBlob(code);
        if (blob) zip.file(`QR-${code}.png`, blob);
        done++;
        setBulkProgress({ done, total: filtered.length });
      }
      const content: Blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${filter === "all" ? "ทั้งหมด" : filter}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert("ดาวน์โหลดล้มเหลว: " + (e as Error).message);
    }
    setBulkLoading(false);
  }

  if (authed === null) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="mb-3">กรุณาเข้าสู่ระบบก่อน</p>
        <a href="/admin" className="text-emerald-500 underline">ไปหน้า Admin</a>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">QR Code สำหรับแต่ละสาขา</h1>
        <a href="/admin" className="text-sm text-gray-600 hover:underline">← Admin</a>
      </header>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm text-gray-700">
        💡 พิมพ์ QR ติดที่ร้าน → ลูกค้าสแกน → เข้าหน้าสาขา → กดเพิ่มเพื่อน Line + สมัครสมาชิก (ระบบนับให้)
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {regions.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold ${
              filter === r ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? `ทั้งหมด (${BRANCHES.length})` : `${r} (${BRANCHES.filter(b => b.region === r).length})`}</button>
        ))}
      </div>

      <button onClick={downloadAll} disabled={bulkLoading}
        className="block w-full mb-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg">
        {bulkLoading 
          ? `กำลังเตรียม... ${bulkProgress.done}/${bulkProgress.total}` 
          : `📦 ดาวน์โหลดทั้งหมด (${filtered.length} สาขา เป็น .zip)`}
      </button>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(b => {
          const code = b.name.split(":")[0];
          return <QRCard key={code} code={code} name={b.name} region={b.region}/>;
        })}
      </div>
    </div>
  );
}
