"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

export default function RegistrationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [region, setRegion] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/registrations/summary?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const branchRegion: Record<string, string> = {};
  BRANCHES.forEach(b => {
    const code = b.name.split(":")[0];
    branchRegion[code] = b.region;
  });

  const filtered = region === "all" 
    ? data 
    : data.filter(r => branchRegion[r.branch_code] === region);
  
  const total = filtered.reduce((s, r) => s + r.count, 0);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📊 สถิติคลิกสมัครสมาชิก</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {[7, 30, 60, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              days === d ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{d} วัน</button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["all", "R1", "R2", "R3", "R4"].map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              region === r ? "bg-blue-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? "ทั้งประเทศ" : `ภาค ${r}`}</button>
        ))}
      </div>

      <div className="bg-emerald-50 p-4 rounded-lg mb-4">
        <div className="text-sm text-gray-600">รวมคลิก {region === "all" ? "ทั่วประเทศ" : `ภาค ${region}`}</div>
        <div className="text-3xl font-bold text-emerald-700">{total.toLocaleString()} ครั้ง</div>
        <div className="text-xs text-gray-500 mt-1">{filtered.length} สาขามีคลิก</div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-3 text-left">รหัส</th>
                <th className="p-3 text-left">ภาค</th>
                <th className="p-3 text-right">คลิก</th>
                <th className="p-3 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.branch_code} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono font-semibold">{r.branch_code}</td>
                  <td className="p-3 text-xs">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {branchRegion[r.branch_code] || "?"}
                    </span>
                  </td>
                  <td className="p-3 text-right">{r.count}</td>
                  <td className="p-3 text-right text-gray-500 text-sm">
                    {total ? ((r.count / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">ยังไม่มีข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <a href={`/api/registrations/export?days=${days}`}
        className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
        📥 Export CSV (ทั้งหมด)
      </a>
    </main>
  );
}
