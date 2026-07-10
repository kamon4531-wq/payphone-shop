"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function ymLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

function buildMonths() {
  const out: { value: string; label: string }[] = [{ value: "all", label: "ทั้งหมด" }];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ value, label: `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}` });
  }
  return out;
}

export default function RegistrationsPage() {
  const months = buildMonths();
  const [month, setMonth] = useState(months[1].value);
  const [region, setRegion] = useState("all");
  const [metric, setMetric] = useState<"members" | "line">("members");
  const [loading, setLoading] = useState(true);
  const [hideZero, setHideZero] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<{ rows: any[]; months: string[] }>({ rows: [], months: [] });

  const isAll = month === "all";

  useEffect(() => {
    setLoading(true);
    if (month === "all") {
      fetch(`/api/registrations/summary?matrix=1`)
        .then(r => r.json())
        .then(d => { setMatrix({ rows: d.rows || [], months: d.months || [] }); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      fetch(`/api/registrations/summary?month=${month}`)
        .then(r => r.json())
        .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [month]);

  const branchInfo = BRANCHES.map(b => ({ code: b.name.split(":")[0], region: b.region }));
  const inRegion = (code: string) => {
    if (region === "all") return true;
    return branchInfo.find(b => b.code === code)?.region === region;
  };

  // ---- โหมดเดือนเจาะจง ----
  const dataMap: Record<string, any> = {};
  data.forEach(r => { dataMap[r.branch_code] = r; });
  const allRows = branchInfo.map(b => {
    const r = dataMap[b.code] || { register: 0, line: 0, count: 0 };
    return { branch_code: b.code, region: b.region, register: r.register || 0, line: r.line || 0, count: r.count || 0 };
  });
  let filtered = region === "all" ? allRows : allRows.filter(r => r.region === region);
  if (hideZero) filtered = filtered.filter(r => r.count > 0);
  filtered.sort((a, b) => b.count - a.count);
  const totalReg = filtered.reduce((s, r) => s + r.register, 0);
  const totalLine = filtered.reduce((s, r) => s + r.line, 0);
  const totalAll = totalReg + totalLine;
  const monthLabel = months.find(m => m.value === month)?.label || month;

  // ---- โหมดทั้งหมด (matrix) ----
  const mMonths = matrix.months;
  const mMap: Record<string, Record<string, { members: number; line: number }>> = {};
  matrix.rows.forEach((r: any) => {
    if (!mMap[r.branch_code]) mMap[r.branch_code] = {};
    mMap[r.branch_code][r.ym] = { members: r.members || 0, line: r.line_friends || 0 };
  });
  const cell = (code: string, ym: string) => (mMap[code]?.[ym]?.[metric]) || 0;
  const branchTotal = (code: string) => mMonths.reduce((s, ym) => s + cell(code, ym), 0);
  let mBranches = branchInfo.filter(b => inRegion(b.code));
  if (hideZero) mBranches = mBranches.filter(b => branchTotal(b.code) > 0);
  mBranches.sort((a, b) => branchTotal(b.code) - branchTotal(a.code));
  const colTotal = (ym: string) => mBranches.reduce((s, b) => s + cell(b.code, ym), 0);
  const grandTotal = mMonths.reduce((s, ym) => s + colTotal(ym), 0);

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📊 สถิติสมาชิก & Line OA</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {months.map(m => (
          <button key={m.value} onClick={() => setMonth(m.value)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold ${
              month === m.value ? "bg-emerald-500 text-white" : "bg-white border"
            }`}
          >{m.label}</button>
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

      {isAll && (
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMetric("members")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${metric === "members" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >👥 สมาชิก</button>
          <button onClick={() => setMetric("line")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold ${metric === "line" ? "bg-green-600 text-white" : "bg-white border"}`}
          >➕ Line OA</button>
        </div>
      )}

      <label className="flex items-center gap-2 mb-3 text-sm">
        <input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)}/>
        ซ่อนสาขาที่ยังไม่มีข้อมูล
      </label>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4 text-xs text-amber-800">
        ℹ️ <b>สมาชิก</b> = จำนวนสมาชิกจริงจากส่วนกลาง (อัปโหลดรายเดือน) · <b>Line OA</b> = จำนวนเพื่อนใน Line OA · เดือนที่ยังไม่อัปโหลด ระบบนับให้อัตโนมัติ
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">กำลังโหลด...</div>
      ) : isAll ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">รหัส</th>
                <th className="p-3 text-left">ภาค</th>
                {mMonths.map(ym => <th key={ym} className="p-3 text-right whitespace-nowrap">{ymLabel(ym)}</th>)}
                <th className="p-3 text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              {mBranches.map(b => (
                <tr key={b.code} className={`border-t ${branchTotal(b.code) === 0 ? "text-gray-400" : "hover:bg-gray-50"}`}>
                  <td className="p-3 font-mono font-semibold">{b.code}</td>
                  <td className="p-3 text-xs"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{b.region}</span></td>
                  {mMonths.map(ym => <td key={ym} className="p-3 text-right">{cell(b.code, ym).toLocaleString()}</td>)}
                  <td className="p-3 text-right font-semibold">{branchTotal(b.code).toLocaleString()}</td>
                </tr>
              ))}
              {mBranches.length === 0 && <tr><td colSpan={mMonths.length + 3} className="p-8 text-center text-gray-400">ไม่มีสาขา</td></tr>}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="p-3" colSpan={2}>รวมทุกสาขา</td>
                {mMonths.map(ym => <td key={ym} className="p-3 text-right">{colTotal(ym).toLocaleString()}</td>)}
                <td className="p-3 text-right text-emerald-700">{grandTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">👥 สมาชิก</div>
              <div className="text-2xl font-bold text-blue-700">{totalReg.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">➕ เพื่อน Line OA</div>
              <div className="text-2xl font-bold text-green-700">{totalLine.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600">รวม ({monthLabel})</div>
              <div className="text-2xl font-bold text-emerald-700">{totalAll.toLocaleString()}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">รหัส</th>
                  <th className="p-3 text-left">ภาค</th>
                  <th className="p-3 text-right text-blue-700">สมาชิก</th>
                  <th className="p-3 text-right text-green-700">Line OA</th>
                  <th className="p-3 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.branch_code} className={`border-t ${r.count === 0 ? "text-gray-400" : "hover:bg-gray-50"}`}>
                    <td className="p-3 font-mono font-semibold">{r.branch_code}</td>
                    <td className="p-3 text-xs"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{r.region}</span></td>
                    <td className="p-3 text-right">{r.register}</td>
                    <td className="p-3 text-right">{r.line}</td>
                    <td className="p-3 text-right font-semibold">{r.count}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">ไม่มีสาขา</td></tr>}
              </tbody>
            </table>
          </div>
          <a href={`/api/registrations/export?month=${month}`}
            className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
            📥 Export CSV ({monthLabel})
          </a>
        </>
      )}
    </main>
  );
}
