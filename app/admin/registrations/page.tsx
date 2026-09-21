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
  const [me, setMe] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshMsg, setRefreshMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(d => setMe(d?.user || null)).catch(() => {});
  }, []);
  const lockedRegion = me?.role === "region_manager" ? (me.region_code || "all") : null;
  const effRegion = lockedRegion || region;

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
  }, [month, reloadKey]);

  async function refreshFromLine() {
    if (refreshing) return;
    setRefreshing(true); setRefreshMsg("กำลังดึงยอดจาก LINE...");
    try {
      const r = await fetch("/api/line/insight", { method: "POST" });
      const d = await r.json();
      if (r.ok) { setRefreshMsg(`✅ อัปเดตแล้ว ${d.updated} สาขา`); setReloadKey(k => k + 1); }
      else setRefreshMsg("❌ ดึงไม่สำเร็จ");
    } catch { setRefreshMsg("❌ เชื่อมต่อไม่ได้"); }
    setRefreshing(false);
    setTimeout(() => setRefreshMsg(""), 6000);
  }

  const branchInfo = BRANCHES.map(b => ({ code: b.name.split(":")[0], region: b.region }));
  const inRegion = (code: string) => {
    if (effRegion === "all") return true;
    return branchInfo.find(b => b.code === code)?.region === effRegion;
  };

  const dataMap: Record<string, any> = {};
  data.forEach(r => { dataMap[r.branch_code] = r; });
  const allRows = branchInfo.map(b => {
    const r = dataMap[b.code] || { register: 0, line: 0, count: 0, total: null };
    return { branch_code: b.code, region: b.region, register: r.register || 0, line: r.line || 0, total: (r.total ?? null), count: r.count || 0 };
  });
  let filtered = effRegion === "all" ? allRows : allRows.filter(r => r.region === effRegion);
  if (hideZero) filtered = filtered.filter(r => r.count > 0);
  filtered.sort((a, b) => b.count - a.count);
  const totalReg = filtered.reduce((s, r) => s + r.register, 0);
  const totalLine = filtered.reduce((s, r) => s + r.line, 0);
  const totalAll = totalReg + totalLine;
  const monthLabel = months.find(m => m.value === month)?.label || month;

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

      {lockedRegion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3 text-sm text-blue-800">
          👤 คุณดูข้อมูลได้เฉพาะ <b>ภาค {lockedRegion}</b> ที่คุณดูแล
        </div>
      )}

      <div className="flex
