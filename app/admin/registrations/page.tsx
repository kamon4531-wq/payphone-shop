"use client";
import { useEffect, useMemo, useState } from "react";
import { BRANCHES } from "@/lib/types";

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

function getThaiNow(): Date {
  return new Date(Date.now() + 7 * 3600 * 1000);
}

function getCurrentThaiYear(): number {
  return getThaiNow().getUTCFullYear();
}

function getCurrentThaiMonth(): string {
  const t = getThaiNow();
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// Return all 12 months of the given year in order Jan..Dec
function getYearMonthOptions(year: number): string[] {
  const list: string[] = [];
  for (let i = 1; i <= 12; i++) {
    list.push(`${year}-${String(i).padStart(2, "0")}`);
  }
  return list;
}

function formatMonthLabel(ym: string): string {
  const parts = ym.split("-");
  if (parts.length !== 2) return ym;
  const m = parseInt(parts[1]);
  return THAI_MONTHS[m - 1] || ym;
}

// Selection value:
//   "all-<year>" → whole year (Jan-Dec)
//   "<year>-<mm>" → single month
type Selection = { kind: "year"; year: number } | { kind: "month"; ym: string };

function parseSelection(v: string): Selection {
  if (v.startsWith("all-")) {
    return { kind: "year", year: parseInt(v.slice(4)) };
  }
  return { kind: "month", ym: v };
}

function buildQuery(sel: Selection): string {
  if (sel.kind === "year") return `year=${sel.year}`;
  return `month=${encodeURIComponent(sel.ym)}`;
}

export default function RegistrationsPage() {
  const [data, setData] = useState<any[]>([]);
  const currentYear = useMemo(() => getCurrentThaiYear(), []);
  const [year, setYear] = useState<number>(currentYear);
  const [selected, setSelected] = useState<string>(getCurrentThaiMonth());
  const [region, setRegion] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hideZero, setHideZero] = useState(false);

  const yearOptions = useMemo(() => {
    // Show current year and previous 2 years
    return [currentYear, currentYear - 1, currentYear - 2];
  }, [currentYear]);

  const monthOptions = useMemo(() => getYearMonthOptions(year), [year]);

  useEffect(() => {
    setLoading(true);
    const sel = parseSelection(selected);
    fetch(`/api/registrations/summary?${buildQuery(sel)}`)
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selected]);

  const dataMap: Record<string, any> = {};
  data.forEach(r => { dataMap[r.branch_code] = r; });

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

  const sel = parseSelection(selected);
  const currentLabel = sel.kind === "year"
    ? `ทั้งหมด (ม.ค. - ธ.ค. ${sel.year + 543})`
    : `${formatMonthLabel(sel.ym)} ${parseInt(sel.ym.split("-")[0]) + 543}`;

  function selectYear(y: number) {
    setYear(y);
    // Keep same month if year changes but selection was month
    if (sel.kind === "month") {
      const mm = sel.ym.split("-")[1];
      setSelected(`${y}-${mm}`);
    } else {
      setSelected(`all-${y}`);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📊 สถิติคลิกสมาชิก & Line OA</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">เลือกปี</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {yearOptions.map(y => (
            <button key={y} onClick={() => selectYear(y)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border ${
                year === y ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
              }`}
            >{y + 543}</button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">เลือกเดือน</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setSelected(`all-${year}`)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border ${
              selected === `all-${year}` ? "bg-purple-600 text-white border-purple-600" : "bg-white"
            }`}
          >ทั้งหมด</button>
          {monthOptions.map(ym => (
            <button key={ym} onClick={() => setSelected(ym)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border ${
                selected === ym ? "bg-emerald-500 text-white border-emerald-500" : "bg-white"
              }`}
            >{formatMonthLabel(ym)}</button>
          ))}
        </div>
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

      <div className="text-xs text-gray-500 mb-2">
        กำลังดู: <span className="font-semibold text-gray-800">{currentLabel}</span>
      </div>

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

      <a href={`/api/registrations/export?${buildQuery(sel)}`}
        className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
        📥 Export CSV ({currentLabel})
      </a>
    </main>
  );
}
