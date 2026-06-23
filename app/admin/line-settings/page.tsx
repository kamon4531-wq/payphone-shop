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

export default function LineSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

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

  const configured = new Set(settings.map(s => s.branch_code));
  const notConfigured = BRANCHES.filter(b => !configured.has(b.name.split(":")[0]));

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">🔔 ตั้งค่า Line Notification สาขา</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 text-sm">
        💡 ออเดอร์ใหม่จะถูกส่งเข้า Line OA ของสาขาอัตโนมัติ (เฉพาะสาขาที่ตั้งค่าไว้)
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-600">
          ตั้งค่าแล้ว: <b className="text-emerald-600">{settings.length}</b> / {BRANCHES.length} สาขา
        </div>
        <button onClick={() => setEditing({ branch_code: "", channel_access_token: "", recipient_id: "", enabled: true, notes: "" })}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + เพิ่มสาขา
        </button>
      </div>

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
              onChange={e => setEditing({ ...editing, recipient_id: e.target.value })}
              className="w-full border rounded-lg p-2 mt-1 font-mono text-xs"
              placeholder="ถ้าไม่ใส่ = Broadcast ส่งให้ทุกคนที่เป็นเพื่อน"/>
            <p className="text-xs text-gray-500 mt-1">User ID (U...) ของพนักงานคนเดียว หรือ Group ID (C...) ของกลุ่ม Line สาขา</p>
          </div>

          <div>
            <label className="text-sm font-semibold">หมายเหตุ</label>
            <input value={editing.notes || ""}
              onChange={e => setEditing({ ...editing, notes: e.target.value })}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="เช่น 'admin: นาย A | group: พนักงานสาขา'"/>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={editing.enabled}
              onChange={e => setEditing({ ...editing, enabled: e.target.checked })}/>
            <span className="text-sm">เปิดใช้งาน</span>
          </label>

          <div className="flex gap-2">
            <button className="bg-emerald-500 text-white px-4 py-2 rounded font-semibold">บันทึก</button>
            <button type="button" onClick={() => setEditing(null)} className="bg-gray-200 px-4 py-2 rounded">ยกเลิก</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">กำลังโหลด...</div>
      ) : (
        <div className="space-y-2">
          {settings.map(s => (
            <div key={s.branch_code} className="bg-white p-3 rounded-xl shadow flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="font-bold">{s.branch_code}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Token: <span className="font-mono">{s.channel_access_token.slice(0, 12)}...{s.channel_access_token.slice(-8)}</span>
                </div>
                {s.recipient_id && (
                  <div className="text-xs text-gray-500">
                    Recipient: <span className="font-mono">{s.recipient_id}</span>
                  </div>
                )}
                {s.notes && <div className="text-xs text-gray-400 italic">{s.notes}</div>}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${s.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {s.enabled ? "✓ เปิด" : "ปิด"}
              </span>
              <button onClick={() => test(s.branch_code)} disabled={testing === s.branch_code}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs px-3 py-2 rounded font-semibold">
                {testing === s.branch_code ? "กำลังส่ง..." : "🧪 ทดสอบ"}
              </button>
              <button onClick={() => setEditing(s)}
                className="bg-gray-200 hover:bg-gray-300 text-xs px-3 py-2 rounded">แก้ไข</button>
              <button onClick={() => del(s.branch_code)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded">ลบ</button>
            </div>
          ))}
          {settings.length === 0 && (
            <div className="text-center py-12 text-gray-400">ยังไม่มีสาขาที่ตั้งค่า — กด "+ เพิ่มสาขา" เพื่อเริ่ม</div>
          )}
        </div>
      )}
    </main>
  );
}
