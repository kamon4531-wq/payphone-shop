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
type BulkResult = { code: string; ok: boolean; msg: string };
type CheckResult = { branch: string; ok: boolean; active: boolean; urlMatch: boolean; note: string };

export default function LineSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [hookBusy, setHookBusy] = useState(false);
  const [hookResults, setHookResults] = useState<HookResult[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [checkBusy, setCheckBusy] = useState(false);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

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

  const validBranches = new Set(BRANCHES.map(b => b.name.split(":")[0]));

  // นำเข้าหลายสาขาทีเดียว: วางจาก Excel ได้เลย (จับรหัส Bxx + Token อัตโนมัติ)
  async function importBulk() {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    const parsed: { code: string; token: string }[] = [];
    for (const line of lines) {
      const cells = line.split(/[\t,;|]+/).map(s => s.trim()).filter(Boolean);
      const code = (cells.find(c => /^B\d+$/i.test(c)) || "").toUpperCase();
      const token = cells.find(c => c.length >= 50) || "";
      if (code && token && validBranches.has(code)) parsed.push({ code, token });
    }
    if (parsed.length === 0) { alert("ไม่พบข้อมูลที่ใช้ได้ (ต้องมีรหัสสาขา Bxx และ Token ยาวๆ ในบรรทัดเดียวกัน)"); return; }
    if (!confirm(`นำเข้า ${parsed.length} สาขา?\n(สาขาที่มีอยู่แล้วจะถูกอัปเดตทับด้วยค่าใหม่)`)) return;
    setBulkBusy(true);
    setBulkResults([]);
    const out: BulkResult[] = [];
    for (const p of parsed) {
      try {
        const r = await fetch("/api/line-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_code: p.code, channel_access_token: p.token, enabled: true })
        });
        out.push(r.ok ? { code: p.code, ok: true, msg: "บันทึกสำเร็จ" } : { code: p.code, ok: false, msg: "บันทึกล้มเหลว " + r.status });
      } catch (e: any) {
        out.push({ code: p.code, ok: false, msg: e.message || "network error" });
      }
      setBulkResults([...out]);
    }
    setBulkBusy(false);
    await load();
  }

  const configured = new Set(settings.map(s => s.branch_code));
  const notConfigured = BRANCHES.filter(b => !configured.has(b.name.split(":")[0]));
  const hookOk = hookResults.filter(r => r.ok).length;
  const hookFail = hookResults.length - hookOk;
  const sortedResults = [...hookResults].sort((a, b) => Number(a.ok) - Number(b.ok));
  const bulkOk = bulkResults.filter(r => r.ok).length;
  const bulkFail = bulkResults.length - bulkOk;

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

  // เช็กสถานะ webhook จริงจาก LINE (URL ตรง + Use webhook เปิด) ทีละสาขา
  async function checkWebhooks() {
    if (settings.length === 0) { alert("ยังไม่มีสาขาที่ตั้งค่า Token"); return; }
    setCheckBusy(true);
    setCheckResults([]);
    const out: CheckResult[] = [];
    for (const s of settings) {
      try {
        const r = await fetch("/api/line-settings/check-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch: s.branch_code })
        });
        const d = await r.json();
        const one = (d.results && d.results[0]) || { branch: s.branch_code, ok: false, active: false, urlMatch: false, note: d.error || "unknown" };
        out.push(one);
      } catch (e: any) {
        out.push({ branch: s.branch_code, ok: false, active: false, urlMatch: false, note: e.message || "network error" });
      }
      setCheckResults([...out]);
    }
    setCheckBusy(false);
  }

  const checkOk = checkResults.filter(r => r.ok).length;
  const checkFail = checkResults.length - checkOk;
  const sortedCheck = [...checkResults].sort((a, b) => Number(a.ok) - Number(b.ok));

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
          <button onClick={() => setBulkOpen(v => !v)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            📥 นำเข้าหลายสาขา
          </button>
          <button onClick={setupWebhooks} disabled={hookBusy}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {hookBusy ? `กำลังตรวจ ${hookResults.length}/${settings.length}...` : "🔗 ตั้ง + เช็ค Webhook ทุกสาขา"}
          </button>
          <button onClick={checkWebhooks} disabled={checkBusy}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            {checkBusy ? `กำลังเช็ก ${checkResults.length}/${settings.length}...` : "🔎 เช็กสถานะจริง"}
          </button>
          <button onClick={() => setEditing({ branch_code: "", channel_access_token: "", recipient_id: "", enabled: true, notes: "" })}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            + เพิ่มสาขา
          </button>
        </div>
      </div>

      {bulkOpen && (
        <div className="bg-white border-2 border-indigo-200 rounded-xl shadow p-4 mb-4">
          <div className="font-semibold text-sm mb-1">📥 นำเข้าหลายสาขาทีเดียว</div>
          <div className="text-xs text-gray-600 mb-2">
            ก๊อปจาก Excel มาวางได้เลย (วางทั้งแถวก็ได้ ระบบจับ “รหัส Bxx” กับ “Token” ให้เอง) — 1 สาขาต่อ 1 บรรทัด
          </div>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={8} disabled={bulkBusy}
            className="w-full border rounded-lg p-2 font-mono text-xs"
            placeholder={"ตัวอย่าง (วางจาก Excel):\nB02\tPA เซ็นทรัล ขอนแก่น\t0K/tgS3meg...(Token ยาว)...=\nB07\tPA สุรินทร์\t8VwEqbcu16...(Token ยาว)...="}/>
          <div className="flex gap-2 mt-2 items-center flex-wrap">
            <button onClick={importBulk} disabled={bulkBusy || !bulkText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              {bulkBusy ? `กำลังนำเข้า ${bulkResults.length}...` : "▶ เริ่มนำเข้า"}
            </button>
            <span className="text-xs text-gray-500">Token เป็นความลับ — วางในเครื่องคุณเท่านั้น อย่าแชร์</span>
          </div>
          {bulkResults.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <div className="text-sm font-semibold mb-1">
                นำเข้า — ✅ สำเร็จ <span className="text-emerald-600">{bulkOk}</span> · ❌ ไม่สำเร็จ <span className="text-red-600">{bulkFail}</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1">
                {bulkResults.map(r => (
                  <div key={r.code} className={`text-xs flex gap-2 ${r.ok ? "text-emerald-700" : "text-red-600"}`}>
                    <span className="font-mono font-bold w-14 shrink-0">{r.code}</span>
                    <span>{r.ok ? "✅ " : "❌ "}{r.msg}</span>
                  </div>
                ))}
              </div>
              {bulkFail === 0 && !bulkBusy && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2 mt-2">
                  ✅ นำเข้าครบแล้ว — ต่อไปกดปุ่มม่วง “ตั้ง + เช็ค Webhook ทุกสาขา” เพื่อเปิดการนับเพื่อน
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {checkResults.length > 0 && (
        <div className="bg-white border-2 border-teal-200 rounded-xl shadow p-3 mb-4">
          <div className="font-semibold text-sm mb-2">
            🔎 สถานะจริงจาก LINE — ✅ พร้อมนับ <span className="text-emerald-600">{checkOk}</span> · ❌ ยังไม่พร้อม <span className="text-red-600">{checkFail}</span>
            <span className="text-gray-500 font-normal"> (เช็กแล้ว {checkResults.length}/{settings.length} สาขา)</span>
          </div>
          {checkFail > 0 && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
              ⚠️ สาขาที่ ❌ = LINE ยังไม่ส่งข้อมูลคนแอดมาให้ (มักเพราะ "Use webhook = ปิด") → ต้องเปิดสวิตช์ Webhook ที่สาขานั้น
            </div>
          )}
          <div className="max-h-72 overflow-y-auto space-y-1">
            {sortedCheck.map(r => (
              <div key={r.branch} className={`text-xs flex gap-2 items-start ${r.ok ? "text-emerald-700" : "text-red-600"}`}>
                <span className="font-mono font-bold w-14 shrink-0">{r.branch}</span>
                <span className="break-all">{r.ok ? "✅ " : "❌ "}{r.note}</span>
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
