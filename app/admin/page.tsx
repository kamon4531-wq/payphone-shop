"use client";
import { useEffect, useState } from "react";
import { Product, Order, CATEGORIES } from "@/lib/types";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/me").then(r => setAuthed(r.ok));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    });
    if (r.ok) setAuthed(true); else setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  if (authed === null) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={login} className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold text-center">เข้าสู่ระบบ Admin</h1>
        <input value={u} onChange={e => setU(e.target.value)} placeholder="ชื่อผู้ใช้" className="w-full border rounded p-2"/>
        <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="รหัสผ่าน" className="w-full border rounded p-2"/>
        {err && <div className="text-red-500 text-sm">{err}</div>}
        <button className="w-full bg-emerald-500 text-white py-2 rounded font-semibold">เข้าสู่ระบบ</button>
        <a href="/" className="block text-center text-xs text-gray-500 hover:underline">← กลับหน้าร้าน</a>
      </form>
    </div>
  );

  return <Dashboard />;
}

function Dashboard() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <a href="/" className="text-sm text-gray-600 hover:underline">← หน้าร้าน</a>
          <button
            onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); }}
            className="text-sm text-red-500"
          >ออกจากระบบ</button>
        </div>
      </header>
      <div className="flex gap-2 mb-4 border-b">
        {["products", "orders"].map(t => (
          <button key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 ${tab === t ? "border-b-2 border-emerald-500 font-semibold" : "text-gray-500"}`}
          >{t === "products" ? "สินค้า" : "ออเดอร์"}</button>
        ))}
      </div>
      {tab === "products" ? <ProductsTab /> : <OrdersTab />}
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/products");
    const d = await r.json();
    setProducts(d.products || []);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    let image_url = editing?.image_url || "";
    let drive_file_id = editing?.drive_file_id || null;
    if (file) {
      const fd = new FormData(); fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) { alert("อัพโหลดรูปล้มเหลว"); setBusy(false); return; }
      const j = await up.json(); image_url = j.url; drive_file_id = j.id;
    }
    const body = { ...editing, image_url, drive_file_id };
    const r = await fetch("/api/products", {
      method: editing?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setBusy(false);
    if (r.ok) { setEditing(null); setFile(null); load(); }
    else alert("บันทึกล้มเหลว");
  }

  async function del(id: string) {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <button onClick={() => setEditing({ category: "case", price: 0, old_price: null })}
        className="mb-4 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold">
        + เพิ่มสินค้า
      </button>

      {editing && (
        <form onSubmit={save} className="bg-white p-4 rounded-xl shadow mb-4 space-y-3">
          <h3 className="font-semibold">{editing.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h3>
          <input required placeholder="ชื่อสินค้า" value={editing.name || ""}
            onChange={e => setEditing({ ...editing, name: e.target.value })}
            className="w-full border p-2 rounded"/>
          <select value={editing.category || "case"}
            onChange={e => setEditing({ ...editing, category: e.target.value })}
            className="w-full border p-2 rounded">
            {CATEGORIES.filter(c => c.id !== "all").map(c =>
              <option key={c.id} value={c.id}>{c.name}</option>
            )}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" placeholder="ราคา" value={editing.price ?? ""}
              onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
              className="border p-2 rounded"/>
            <input type="number" placeholder="ราคาเก่า (ไม่บังคับ)" value={editing.old_price ?? ""}
              onChange={e => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })}
              className="border p-2 rounded"/>
          </div>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)}/>
          {editing.image_url && !file && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={editing.image_url} className="w-24 h-24 object-contain border rounded" alt=""/>
          )}
          <div className="flex gap-2">
            <button disabled={busy} className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50">
              {busy ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button type="button" onClick={() => { setEditing(null); setFile(null); }}
              className="bg-gray-200 px-4 py-2 rounded">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {products.map(p => (
          <div key={p.id} className="bg-white p-3 rounded-xl shadow flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} className="w-16 h-16 object-contain bg-gray-50 rounded" alt=""/>
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-500">{CATEGORIES.find(c => c.id === p.category)?.name}</div>
              <div className="text-emerald-600 font-bold">฿{p.price.toLocaleString()}</div>
            </div>
            <button onClick={() => setEditing(p)} className="text-sm text-blue-500">แก้ไข</button>
            <button onClick={() => del(p.id)} className="text-sm text-red-500">ลบ</button>
          </div>
        ))}
        {products.length === 0 && <div className="text-center text-gray-500 py-8">ยังไม่มีสินค้า</div>}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders/list").then(r => r.json()).then(d => setOrders(d.orders || []));
  }, []);
  return (
    <div className="grid gap-2">
      {orders.map(o => (
        <div key={o.id} className="bg-white p-3 rounded-xl shadow">
          <div className="flex justify-between text-xs text-gray-500">
            <span>#{o.id.slice(0, 8)}</span>
            <span>{new Date(o.created_at).toLocaleString("th-TH")}</span>
          </div>
          <div className="font-medium mt-1">{o.product_name}</div>
          <div className="text-sm">ลูกค้า: <b>{o.customer_name}</b> · โทร: <a className="text-blue-500" href={`tel:${o.phone}`}>{o.phone}</a></div>
          <div className="text-emerald-600 font-bold">฿{o.price.toLocaleString()}</div>
        </div>
      ))}
      {orders.length === 0 && <div className="text-center text-gray-500 py-8">ยังไม่มีออเดอร์</div>}
    </div>
  );
}
