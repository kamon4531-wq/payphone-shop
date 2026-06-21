"use client";
import { useState } from "react";
import { BRANCHES } from "@/lib/types";

export default function BranchesPage() {
  const [region, setRegion] = useState<string>("all");
  const [q, setQ] = useState("");

  const regions = ["all", "R1", "R2", "R3", "R4"];

  const filtered = BRANCHES.filter(b =>
    (region === "all" || b.region === region) &&
    (q === "" || b.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🏬 หาสาขา PAY BY PA.PHONE</h1>
        <a href="/" className="text-sm text-emerald-600 hover:underline">← หน้าหลัก</a>
      </header>

      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="🔍 ค้นหา เช่น ขอนแก่น, ภูเก็ต, เซ็นทรัล..."
        className="w-full border rounded-lg px-3 py-2 mb-3"/>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {regions.map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              region === r ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? `ทั้งหมด (${BRANCHES.length})` : `${r} (${BRANCHES.filter(b => b.region === r).length})`}</button>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-2">พบ {filtered.length} สาขา</div>

      <div className="grid gap-2">
        {filtered.map(b => {
          const code = b.name.split(":")[0];
          const shopName = b.name.split(":")[1] || b.name;
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent("PA.PHONE " + shopName)}`;
          return (
            <div key={b.name} className="bg-white p-3 rounded-xl shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded mr-2">{b.region}</span>
                    <span className="font-mono">{code}</span>
                  </div>
                  <div className="font-medium">{shopName}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <a href={mapsUrl} target="_blank" rel="noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-semibold text-center whitespace-nowrap">
                    📍 แผนที่
                  </a>
                  {b.line_oa_id && (
                    <a href={`https://line.me/R/ti/p/${b.line_oa_id}`} target="_blank" rel="noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-semibold text-center whitespace-nowrap">
                      ➕ Line
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">ไม่พบสาขา</div>}
      </div>
    </main>
  );
}
