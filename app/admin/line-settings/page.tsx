"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

type Setting = {
  branch_code: string;
  channel_access_token: string;
  recipient_id: string | null;
  enabled: boolean;
  notes: string | null;
};

type HookResult = { ok: boolean; branch: string; error?: string };

export default function LineSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [hookBusy, setHookBusy] = useState(false);
  const [hookResults, setHookResults] = useState<HookResult[]>([]);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/line-settings");
    const d = await r.json();
    setSettings(d.settings || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const r = await fetch("/api/line-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    if (r.ok) { setEditing(null); load(); }
    else alert("บันทึกล้มเหลว");
  }

  async function del(code: string) {
    if (!confirm(`ลบการตั้งค่าของ ${code}?`)) return;
    const r = await fetch(`/api/line-settings?code=${code}`, { method: "DELETE" });
    if (r.ok) load();
  }

  async function test(code: string) {
    setTesting(code);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const r = await fetch("/api/line-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_code: code }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const d = await r.json();
      setTesting(null);
      if (d.ok) alert(`✅ ส่งทดสอบไป ${code} สำเร็จ! ตรวจ Line OA สาขา`);
      else alert(`❌ ส่งล้มเหลว: ${d.error || "unknown"}`);
    } catch (e: any) {
      setTesting(null);
      alert(`❌ Error: ${e.name === "AbortError" ? "Timeout 15s - API ไม่ตอบ" : e.message}`);
    }
  }

  // ตั้ง + เช็ค webhook ทีละสาขา (โชว์ความคืบหน้า กัน timeout)
  async function setupWebhooks() {
    if (settings.length === 0) { alert("ยังไม่มีสาขาที่ตั้งค่า Token"); return; }
    if (!confirm(`ตั้ง + เช็ค Webhook ทั้งหมด ${settings.length} สาขา?\nใช้เวลาสักครู่ อย่าปิดหน้านี้`)) return;
    setHookBusy(true);
    setHookResults([]);
    const out: HookResult[] = [];
    for (const s of settings) {
      try {
        const r = await fetch("/api/line-settings/set-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch: s.branch_code })
        });
        const d = await r.json();
        const one = (d.results && d.results[0]) || { ok: false, branch: s.branch_code, error: d.error || "unknown" };
        out.push({ ok: !!one.ok, branch: one.branch || s.branch_code, error: one.error });
      } catch (e: any) {
        out.push({ ok: false, branch: s.branch_code, error: e.message || "network error" });
      }
      setHookResults([...out]);
    }
    setHookBusy(false);
  }

  const configured = new Set(settings.map(s => s.branch_code));
  const notConfigured = BRANCHES.filter(b => !configured.has(b.name.split(":")[0]));
  const hookOk = hookResults.filter(r => r.ok).length;
  const hookFail = hookResults.length - hookOk;
  const sortedResults = [...hookResults].sort((a, b) => Number(a.ok) - Number(b.ok));

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🔔 ตั้งค่า Line Notification สาขา</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm">
        💡 ออเดอร์ใหม่จะถูกส่งเข้า Line OA ของสาขาอัตโนมัติ (เฉพาะสาขาที่ตั้งค่าไว้)
      </div>

      <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
        <div className="text-sm text-gray-600">
          ตั้งค่าแล้ว: <b className="text-emerald-600">{settings.length}</b> / {BRANCHES.length} สาขา
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={setupWebhooks} disabled={hookBusy}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {hookBusy ? `กำลังตรวจ ${hookResults.length}/${settings.length}...` : "🔗 ตั้ง + เช็ค Webhook ทุกสาขา"}
          </button>
          <button onClick={() => setEditing({ branch_code: "", channel_access_token: "", recipient_id: "", enabled: true, notes: "" })}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            + เพิ่มสาขา
          </button>
        </div>
      </div>

      {hookResults.length > 0 && (
        <div className="bg-white border rounded-xl shadow p-3 mb-4">
          <div className="font-semibold text-sm mb-2">
            ผลตรวจ Webhook — ✅ สำเร็จ <span className="text-emerald-600">{hookOk}</span> · ❌ ไม่สำเร็จ <span className="text-red-600">{hookFail}</span>
            <span className="text-gray-500 font-normal"> (ตรวจแล้ว {hookResults.length}/{settings.length} สาขา)</span>
          </div>
          {hookFail > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2">
              ⚠️ สาขาที่ ❌ จะไม่ถูกนับจำนวนเพื่อน Line — ต้องแก้ Token หรือตั้งค่าใน Line OA ก่อน
            </div>
          )}
          <div className="max-h-72 overflow-y-auto space-y-1">
            {sortedResults.map(r => (
              <div key={r.branch} className={`text-xs flex gap-2 items-start ${r.ok ? "text-emerald-700" : "text-red-600"}`}>
                <span className="font-mono font-bold w-14 shrink-0">{r.branch}</span>
                <span className="break-all">{r.ok ? "✅ เชื่อมต่อสำเร็จ" : `❌ ${r.error || "ไม่สำเร็จ"}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="bg-white p-4 rounded-xl shadow mb-4 space-y-3">
          <h3 className="font-semibold">{editing.branch_code && configured.has(editing.branch_code) ? "แก้ไข" : "เพิ่ม"} Line Notification</h3>

          <div>
            <label className="text-sm font-semibold">สาขา <span className="text-red-500">*</span></label>
            <select required value={editing.branch_code}
              onChange={e => setEditing({ ...editing, branch_code: e.target.value })}
              className="w-full border rounded-lg p-2 mt-1"
              disabled={!!configured.has(editing.branch_code) && editing === editing}>
              <option value="">เลือกสาขา</option>
              {notConfigured.map(b => (
                <option key={b.name} value={b.name.split(":")[0]}>{b.name}</option>
              ))}
              {editing.branch_code && configured.has(editing.branch_code) && (
                <option value={editing.branch_code}>{editing.branch_code}</option>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Channel Access Token <span className="text-red-500">*</span></label>
            <textarea required value={editing.channel_access_token}
              onChange={e => setEditing({ ...editing, channel_access_token: e.target.value })}
              rows={3}
              className="w-full border rounded-lg p-2 mt-1 font-mono text-xs"
              placeholder="วาง Channel Access Token (long-lived) ที่ได้จาก Line OA Manager"/>
            <p className="text-xs text-gray-500 mt-1">หาได้ที่ Line OA Manager → Settings → Messaging API → Channel Access Token</p>
          </div>

          <div>
            <label className="text-sm font-semibold">Recipient User ID (ทางเลือก)</label>
            <input value={editing.recipient_id || ""}
              onChange={e => setEditing({ ...editing, recipient_id:
