"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

const SITE = "https://payphone-shop.vercel.app";

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
        💡 ลูกค้าสแกน QR → เข้าหน้าต้อนรับสาขา → กดดูสินค้า → สั่งซื้อจะ auto-เลือกสาขาที่ถูก
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
          const url = `${SITE}/branch/${code}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(url)}`;
          return (
            <div key={code} className="bg-white p-3 rounded-xl shadow text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt={code} className="w-full aspect-square"/>
              <div className="text-xs font-bold text-emerald-700 mt-2">{b.region}</div>
              <div className="text-xs mb-2 line-clamp-2 min-h-[2rem]">{b.name}</div>
              <a href={qrUrl} download={`QR-${code}.png`} target="_blank" rel="noreferrer"
                className="block bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 rounded">
                📥 ดาวน์โหลด
              </a>
              <div className="text-[10px] text-gray-400 mt-1 break-all">{url}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
