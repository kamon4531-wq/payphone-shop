"use client";
import { useEffect, useMemo, useState } from "react";
import { BRANCHES } from "@/lib/types";

const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const APP_START_YEAR = 2026; // AD

function getThaiNow(): Date {
  return new Date(Date.now() + 7 * 3600 * 1000);
}

function getCurrentYear(): number {
  return getThaiNow().getUTCFullYear();
}

function getCurrentThaiMonth(): string {
  const t = getThaiNow();
  const y = t.getUTCFullYear();
  const m = String(t.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getYearOptions(): number[] {
  const now = getCurrentYear();
  const list: number[] = [];
  for (let y = APP_START_YEAR; y <= now; y++) list.push(y);
  return list;
}

function getYearMonthOptions(year: number): string[] {
  const list: string[] = [];
  for (let i = 1; i <= 12; i++) {
    list.push(`${year}-${String(i).padStart(2, "0")}`);
  }
  return list;
}

function formatMonthShort(ym: string): string {
  const parts = ym.split("-");
  if (parts.length !== 2) return ym;
  const m = parseInt(parts[1]);
  return THAI_MONTHS[m - 1] || ym;
}

type BranchRow = { branch_code: string; register: number; line: number; count: number };

type Selection = { kind: "year"; year: number } | { kind: "month"; ym: string };

function parseSelection(v: string): Selection {
  if (v.startsWith("all-")) return { kind: "year", year: parseInt(v.slice(4)) };
  return { kind: "month", ym: v };
}

async function fetchMonth(ym: string): Promise<BranchRow[]> {
  const r = await fetch(`/api/registrations/summary?month=${encodeURIComponent(ym)}`);
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

export default function RegistrationsPage() {
  const yearOptions = useMemo(() => getYearOptions(), []);
  const [year, setYear] = useState<number>(getCurrentYear());
  const [selected, setSelected] = useState<string>(getCurrentThaiMonth());
  const [region, setRegion] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hideZero, setHideZero] = useState(false);

  // Data source: for month → single BranchRow[]. For year → 12 BranchRow[] (Jan..Dec).
  const [singleData, setSingleData] = useState<BranchRow[]>([]);
  const [monthlyData, setMonthlyData] = useState<BranchRow[][]>([]);

  const monthOptions = useMemo(() => getYearMonthOptions(year), [year]);
  const sel = parseSelection(selected);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (sel.kind === "year") {
        const yms = getYearMonthOptions(sel.year);
        const results = await Promise.all(yms.map(fetchMonth));
        if (!cancelled) { setMonthlyData(results); setSingleData([]); }
      } else {
        const rows = await fetchMonth(sel.ym);
        if (!cancelled) { setSingleData(rows); setMonthlyData([]); }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selected]);

  // Compute branch rows respecting region filter
  const branchesInRegion = useMemo(() => {
    if (region === "all") return BRANCHES;
    return BRANCHES.filter(b => b.region === region);
  }, [region]);

  const branchCodesInRegion = useMemo(
    () => new Set(branchesInRegion.map(b => b.name.split(":")[0])),
    [branchesInRegion]
  );

  // Aggregate: sum monthlyData across all 12 months for the branch view (whole-year totals)
  const aggregatedBranchRows: BranchRow[] = useMemo(() => {
    if (sel.kind === "month") return singleData;
    const map: Record<string, BranchRow> = {};
    for (const monthRows of monthlyData) {
      for (const r of monthRows) {
        if (!map[r.branch_code]) map[r.branch_code] = { branch_code: r.branch_code, register: 0, line: 0, count: 0 };
        map[r.branch_code].register += r.register;
        map[r.branch_code].line += r.line;
        map[r.branch_code].count += r.count;
      }
    }
    return Object.values(map);
  }, [sel, singleData, monthlyData]);

  const dataMap: Record<string, BranchRow> = {};
  aggregatedBranchRows.forEach(r => { dataMap[r.branch_code] = r; });

  const allRows = branchesInRegion.map(b => {
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

  let filteredBranches = hideZero ? allRows.filter(r => r.count > 0) : allRows;
  filteredBranches = [...filteredBranches].sort((a, b) => b.count - a.count);

  const totalReg = filteredBranches.reduce((s, r) => s + r.register, 0);
  const totalLine = filteredBranches.reduce((s, r) => s + r.line, 0);
  const totalAll = totalReg + totalLine;

  // Monthly breakdown table (only for "ทั้งหมด" view), filtered by region
  const monthlyBreakdown = useMemo(() => {
    if (sel.kind !== "year") return [];
    return monthlyData.map((rows, i) => {
      let reg = 0, line = 0;
      for (const r of rows) {
        if (branchCodesInRegion.has(r.branch_code)) {
          reg += r.register;
          line += r.line;
        }
      }
      return { monthIdx: i + 1, monthLabel: THAI_MONTHS[i], register: reg, line: line, count: reg + line };
    });
  }, [sel, monthlyData, branchCodesInRegion]);

  const maxMonthCount = Math.max(1, ...monthlyBreakdown.map(m => m.count));

  const currentLabel = sel.kind === "year"
    ? `ทั้งหมด (ม.ค. - ธ.ค. ${sel.year + 543})`
    : `${formatMonthShort(sel.ym)} ${year + 543}`;

  function selectYear(y: number) {
    setYear(y);
    if (sel.kind === "month") {
      const mm = sel.ym.split("-")[1];
      setSelected(`${y}-${mm}`);
    } else {
      setSelected(`all-${y}`);
    }
  }

  const exportUrl = sel.kind === "year"
    ? `/api/registrations/export?year=${sel.year}`
    : `/api/registrations/export?month=${encodeURIComponent(sel.ym)}`;

  return (
    <main className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">📊 สถิติคลิกสมาชิก & Line OA</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      {yearOptions.length > 1 && (
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
      )}

      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">เลือกเดือน (ปี {year + 543})</div>
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
            >{formatMonthShort(ym)}</button>
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
        <>
          {sel.kind === "year" && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
              <div className="p-3 bg-purple-50 border-b border-purple-200 text-sm font-semibold text-purple-800">
                📅 แยกตามเดือน (ปี {sel.year + 543})
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">เดือน</th>
                    <th className="p-3 text-right text-blue-700">สมัคร</th>
                    <th className="p-3 text-right text-green-700">Line</th>
                    <th className="p-3 text-right">รวม</th>
                    <th className="p-3 text-left w-[35%]">แนวโน้ม</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map((m, idx) => {
                    const prev = idx > 0 ? monthlyBreakdown[idx - 1].count : null;
                    const diff = prev !== null ? m.count - prev : null;
                    const pct = m.count === 0 ? 0 : (m.count / maxMonthCount) * 100;
                    return (
                      <tr key={m.monthIdx} className={`border-t ${m.count === 0 ? "text-gray-400" : "hover:bg-gray-50"}`}>
                        <td className="p-3 font-semibold">{m.monthLabel}</td>
                        <td className="p-3 text-right">{m.register}</td>
                        <td className="p-3 text-right">{m.line}</td>
                        <td className="p-3 text-right font-semibold">
                          {m.count}
                          {diff !== null && diff !== 0 && (
                            <span className={`ml-1 text-xs ${diff > 0 ? "text-green-600" : "text-red-600"}`}>
                              {diff > 0 ? "▲" : "▼"}{Math.abs(diff)}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }}/>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-sm font-semibold text-emerald-800">
              🏬 แยกตามสาขา {sel.kind === "year" ? `(รวมทั้งปี ${sel.year + 543})` : `(${currentLabel})`}
            </div>
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
                {filteredBranches.map(r => (
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
                {filteredBranches.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">ไม่มีสาขา</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <a href={exportUrl}
        className="block mt-4 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold">
        📥 Export CSV ({currentLabel})
      </a>
    </main>
  );
}
