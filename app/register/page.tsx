"use client";
import { useState } from "react";
import { BRANCHES } from "@/lib/types";

export default function RegisterPage() {
  const [region, setRegion] = useState("all");
  const [q, setQ] = useState("");

  const regions = ["all", "R1", "R2", "R3", "R4"];
  const filtered = BRANCHES.filter(b =>
    (region === "all" || b.region === region) &&
    (q === "" || b.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">📝 สมัครสมาชิก PA Member</h1>
          <a href="/" className="text-sm text-emerald-600 hover:underline">← หน้าหลัก</a>
        </header>

        <div className="bg-white p-4 rounded-xl shadow mb-4 text-sm text-gray-700">
          💡 เลือกสาขาที่ต้องการสมัครสมาชิก — สิทธิ์พิเศษ + คะแนนสะสม + โปรเฉพาะสมาชิก
        </div>

        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="🔍 ค้นหา เช่น ขอนแก่น, ภูเก็ต..."
          className="w-full border rounded-lg px-3 py-2 mb-3"/>

        <div className="flex gap-2 mb-3 overflow-x-auto">
          {regions.map(r => (
            <button key={r} onClick={() => setRegion(r)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
                region === r ? "bg-blue-500 text-white" : "bg-white border"
              }`}
            >{r === "all" ? `ทั้งหมด (${BRANCHES.length})` : `${r} (${BRANCHES.filter(b => b.region === r).length})`}</button>
          ))}
        </div>

        <div className="text-xs text-gray-500 mb-2">พบ {filtered.length} สาขา</div>

        <div className="grid gap-2">
          {filtered.map(b => {
            const code = b.name.split(":")[0];
            const shopName = b.name.split(":")[1] || b.name;
            return (
              <a key={b.name} href={`/go/register/${code}`} target="_blank" rel="noreferrer"
                className="bg-white p-3 rounded-xl shadow hover:bg-blue-50 active:scale-98 transition flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded mr-2">{b.region}</span>
                    <span className="font-mono">{code}</span>
                  </div>
                  <div className="font-medium mt-1">{shopName}</div>
                </div>
                <div className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold whitespace-nowrap">
                  สมัคร →
                </div>
              </a>
            );
          })}
          {filtered.length === 0 && <div className="text-center text-gray-500 py-8">ไม่พบสาขา</div>}
        </div>
      </div>
    </main>
  );
}
