"use client";
import { useEffect, useState } from "react";
import { BRANCHES } from "@/lib/types";

type User = {
  id?: number;
  username: string;
  password?: string;
  role: "owner" | "hq_admin" | "region_manager" | "branch";
  branch_code?: string | null;
  region_code?: string | null;
  full_name?: string | null;
  email?: string | null;
  enabled?: boolean;
  last_login_at?: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  hq_admin: "HQ Admin",
  region_manager: "Region Manager",
  branch: "Branch"
};
const ROLE_COLOR: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700",
  hq_admin: "bg-blue-100 text-blue-700",
  region_manager: "bg-orange-100 text-orange-700",
  branch: "bg-emerald-100 text-emerald-700"
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/users");
    if (r.status === 403) { setErr("เฉพาะ Owner เท่านั้น"); setLoading(false); return; }
    const d = await r.json();
    setUsers(d.users || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    const r = await fetch("/api/admin/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing)
    });
    if (r.ok) { setEditing(null); load(); }
    else { const d = await r.json(); alert("Error: " + d.error); }
  }

  async function del(u: User) {
    if (!confirm(`ลบ ${u.username}?`)) return;
    const r = await fetch(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
    if (r.ok) load();
  }

  async function generateAll() {
    if (!confirm("สร้างบัญชีอัตโนมัติ:\n• 4 Region Manager (r1mgr-r4mgr)\n• 56 Branch (b02, b07, ...)\n\nบัญชีที่มีอยู่จะไม่ถูกแก้\n\nดำเนินการ?")) return;
    
    const r = await fetch("/api/admin/users/bulk-create", { method: "POST" });
    if (!r.ok) { alert("เกิดข้อผิดพลาด"); return; }
    const d = await r.json();
    
    alert(`สร้างสำเร็จ ${d.total_created} คน${d.total_skipped > 0 ? `\nข้าม ${d.total_skipped} คน (มีอยู่แล้ว)` : ""}\n\nกำลังดาวน์โหลด CSV...`);
    
    const headers = ["Username","Password","Role","Branch","Region","Name"];
    const rows = d.created.map((u: any) => [
      u.username, u.password, u.role, u.branch_code || "", u.region_code || "", u.full_name || ""
    ]);
    const csv = [headers, ...rows].map((r: any) =>
      r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    
    load();
  }

  if (err) return <div className="p-10 text-center text-red-500">{err}</div>;

  return (
    <main className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">👥 จัดการผู้ใช้งาน</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div className="text-sm text-gray-600">รวม {users.length} คน</div>
        <div className="flex gap-2">
          <button onClick={generateAll}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">🎲 สร้างทั้งหมดอัตโนมัติ</button>
          <button onClick={() => setEditing({ username: "", password: "", role: "branch", enabled: true })}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">+ เพิ่มผู้ใช้</button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-white p-4 rounded-xl shadow mb-4 space-y-3">
          <h3 className="font-semibold">{editing.id ? "แก้ไข" : "เพิ่ม"} ผู้ใช้งาน</h3>

          <div>
            <label className="text-sm font-semibold">Username *</label>
            <input required value={editing.username}
              onChange={e => setEditing({ ...editing, username: e.target.value })}
              disabled={!!editing.id}
              className="w-full border rounded p-2 mt-1 disabled:bg-gray-100"/>
          </div>

          <div>
            <label className="text-sm font-semibold">Password {!editing.id && "*"}</label>
            <input type="password" required={!editing.id} value={editing.password || ""}
              onChange={e => setEditing({ ...editing, password: e.target.value })}
              placeholder={editing.id ? "เว้นว่าง = ไม่เปลี่ยน" : "ตั้งรหัสผ่าน"}
              className="w-full border rounded p-2 mt-1"/>
          </div>

          <div>
            <label className="text-sm font-semibold">Role *</label>
            <select required value={editing.role}
              onChange={e => setEditing({ ...editing, role: e.target.value as any, branch_code: null, region_code: null })}
              className="w-full border rounded p-2 mt-1">
              <option value="owner">Owner (เจ้าของ)</option>
              <option value="hq_admin">HQ Admin (ผู้บริหาร)</option>
              <option value="region_manager">Region Manager (ผจก.ภาค)</option>
              <option value="branch">Branch (สาขา)</option>
            </select>
          </div>

          {editing.role === "region_manager" && (
            <div>
              <label className="text-sm font-semibold">ภาค *</label>
              <select required value={editing.region_code || ""}
                onChange={e => setEditing({ ...editing, region_code: e.target.value })}
                className="w-full border rounded p-2 mt-1">
                <option value="">เลือกภาค</option>
                <option value="R1">R1 (อีสาน) - 14 สาขา</option>
                <option value="R2">R2 (เหนือ+กลาง) - 14 สาขา</option>
                <option value="R3">R3 (ตะวันออก) - 15 สาขา</option>
                <option value="R4">R4 (ใต้+ปริมณฑล) - 13 สาขา</option>
              </select>
            </div>
          )}

          {editing.role === "branch" && (
            <div>
              <label className="text-sm font-semibold">สาขา *</label>
              <select required value={editing.branch_code || ""}
                onChange={e => setEditing({ ...editing, branch_code: e.target.value })}
                className="w-full border rounded p-2 mt-1">
                <option value="">เลือกสาขา</option>
                {BRANCHES.map(b => (
                  <option key={b.name} value={b.name.split(":")[0]}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold">ชื่อ-สกุล</label>
            <input value={editing.full_name || ""}
              onChange={e => setEditing({ ...editing, full_name: e.target.value })}
              className="w-full border rounded p-2 mt-1"/>
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input type="email" value={editing.email || ""}
              onChange={e => setEditing({ ...editing, email: e.target.value })}
              className="w-full border rounded p-2 mt-1"/>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={editing.enabled !== false}
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
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">ขอบเขต</th>
                <th className="p-3 text-left">ชื่อ</th>
                <th className="p-3 text-right">สถานะ</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono font-semibold">{u.username}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ROLE_COLOR[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {u.branch_code && <span>สาขา {u.branch_code}</span>}
                    {u.region_code && !u.branch_code && <span>ภาค {u.region_code}</span>}
                    {!u.branch_code && !u.region_code && <span className="text-gray-400">ทั้งหมด</span>}
                  </td>
                  <td className="p-3 text-xs">{u.full_name || "-"}</td>
                  <td className="p-3 text-right">
                    {u.enabled ? <span className="text-emerald-600 text-xs">✓ Active</span> : <span className="text-gray-400 text-xs">ปิด</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing({ ...u, password: "" })} className="text-blue-500 text-xs mr-2">แก้ไข</button>
                    <button onClick={() => del(u)} className="text-red-500 text-xs">ลบ</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">ยังไม่มีผู้ใช้งาน — กด + เพิ่ม</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
