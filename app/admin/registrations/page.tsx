"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

export default function RegistrationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [region, setRegion] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hideZero, setHideZero] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/registrations/summary?days=${days}`)
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [days]);

  const dataMap: Record<string, any> = {};
  data.forEach(r => { dataMap[r.branch_code] = r; });

  // รวมทุกสาขาในระบบ + รวมข้อมูล
  const allRows = BRANCHES.map(b => {
    const code = b.name.split(":")[0];
    const r = dataMap[code] || { register: 0, line: 0, count: 0 };
    return {
      branch_code: code,
      branch_name: b.name.split(":")[1] || b.name,
      region: b.region,
      register: r.register || 0,
      line: r.line || 0,
      count: r.count || 0
    };
  });

  let filtered = region === "all" ? allRows : allRows.filter(r => r.region === region);
  if (hideZero) filtered = filtered.filter(r => r.count > 0);
  filtered.sort((a, b) => b.count - a.count);

  const totalReg = filtered.reduce((s, r) => s + r.register, 0);
  const totalLine = filtered.reduce((s, r) => s + r.line, 0);
  const totalAll = totalReg + totalLine;

  return (
    <main className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📊 สถิติคลิกสมาชิก & Line OA</h1>
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

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {["all", "R1", "R2", "R3", "R4"].map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              region === r ? "bg-blue-500 text-white" : "bg-white border"
            }`}
          >{r === "all" ? "ทั้งประเทศ" : `ภาค ${r}`}</button>
        ))}
      </div>

      <label className="flex items-center gap-2 mb-4 text-sm">
        <input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)}/>
        ซ่อนสาขาที่ยังไม่มีคลิก
      </label>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">📝 สมัครสมาชิก</div>
          <div className="text-2xl font-bold text-blue-700">{totalReg.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">➕ เพิ่ม Line OA</div>
          <div className="text-2xl font-bold text-green-700">{totalLine.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">รวมทั้งหมด</div>
          <div className="text-2xl font-bold text-emerald-700">{totalAll.toLocaleString()}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">กำลังโหลด...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">รหัส</th>
                <th className="p-3 text-left">ภาค</th>
                <th className="p-3 text-right text-blue-700">สมัคร</th>
                <th className="p-3 text-right text-green-700">Line</th>
                <th className="p-3 text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.branch_code} className={`border-t ${r.count === 0 ? "text-gray-400" : "hover:bg-gray-50"}`}>
                  <td className="p-3 font-mono font-semibold">{r.branch_code}</td>
                  <td className="p-3 text-xs">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{r.region}</span>
                  </td>
                  <td className="p-3 text-right">{r.register}</td>
                  <td className="p-3 text-right">{r.line}</td>
                  <td className="p-3 text-right font-semibold">{r.count}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">ไม่มีสาขา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <a href={`/api/registrations/export?days=${days}`}
        className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
        📥 Export CSV
      </a>
    </main>
  );
}
