"use client";
import { useEffect, useMemo, useState } from "react";
import { Product, Order, CATEGORIES } from "@/lib/types";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");

  useEffect(() => { fetch("/api/admin/me").then(r => setAuthed(r.ok)); }, []);

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
          <button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); }}
            className="text-sm text-red-500">ออกจากระบบ</button>
        </div>
      </header>
      <div className="flex gap-2 mb-4 border-b">
        {["products", "orders"].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
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
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  async function load() {
    const r = await fetch("/api/products");
    const d = await r.json();
    setProducts(d.products || []);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    products.filter(p =>
      (cat === "all" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
    ), [products, cat, q]);

  const countByCat = useMemo(() => {
    const m: Record<string, number> = { all: products.length };
    products.forEach(p => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
  }, [products]);

  async function uploadFile(f: File): Promise<{ url: string; id: string } | null> {
    const fd = new FormData(); fd.append("file", f);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) return null;
    return await up.json();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    let image_url = editing?.image_url || "";
    let image_url2 = editing?.image_url2 || null;
    let image_url3 = editing?.image_url3 || null;
    let drive_file_id = editing?.drive_file_id || null;

    if (file1) {
      const r = await uploadFile(file1);
      if (!r) { alert("อัพโหลดรูปที่ 1 ล้มเหลว"); setBusy(false); return; }
      image_url = r.url; drive_file_id = r.id;
    }
    if (file2) {
      const r = await uploadFile(file2);
      if (!r) { alert("อัพโหลดรูปที่ 2 ล้มเหลว"); setBusy(false); return; }
      image_url2 = r.url;
    }
    if (file3) {
      const r = await uploadFile(file3);
      if (!r) { alert("อัพโหลดรูปที่ 3 ล้มเหลว"); setBusy(false); return; }
      image_url3 = r.url;
    }

    const body = { ...editing, image_url, image_url2, image_url3, drive_file_id };
    const r = await fetch("/api/products", {
      method: editing?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setBusy(false);
    if (r.ok) { setEditing(null); setFile1(null); setFile2(null); setFile3(null); load(); }
    else alert("บันทึกล้มเหลว");
  }

  async function del(id: string) {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    load();
  }

  function ImageSlot({ label, current, file, setFile, onClear }: any) {
    return (
      <div className="border rounded p-2">
        <div className="text-xs font-semibold mb-1">{label}</div>
        {(file || current) && (
          <div className="relative inline-block mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file ? URL.createObjectURL(file) : current}
              className="w-20 h-20 object-contain border rounded" alt=""/>
            {current && !file && (
              <button type="button" onClick={onClear}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">×</button>
            )}
          </div>
        )}
        <input type="file" accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="block w-full text-xs"/>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setEditing({ category: "case", price: 0, old_price: null, description: "", badge_text: "" })}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold">+ เพิ่มสินค้า</button>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="🔍 ค้นหาชื่อสินค้า..."
          className="flex-1 min-w-[200px] border rounded-lg px-3 py-2 text-sm"/>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs border transition ${
              cat === c.id
                ? "bg-emerald-400 border-emerald-400 text-black font-semibold"
                : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300"
            }`}
          >{c.name} ({countByCat[c.id] || 0})</button>
        ))}
      </div>

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
          <input placeholder="ป้ายโปรโมชั่น (เช่น SALE 30%, NEW)" value={editing.badge_text || ""}
            onChange={e => setEditing({ ...editing, badge_text: e.target.value })}
            className="w-full border p-2 rounded"/>
          <textarea placeholder="รายละเอียดสินค้า"
            value={editing.description || ""}
            onChange={e => setEditing({ ...editing, description: e.target.value })}
            rows={5} className="w-full border p-2 rounded resize-y"/>

          <div className="grid grid-cols-3 gap-2">
            <ImageSlot label="รูปหลัก *" current={editing.image_url} file={file1} setFile={setFile1}
              onClear={() => setEditing({ ...editing, image_url: "" })}/>
            <ImageSlot label="รูปที่ 2" current={editing.image_url2} file={file2} setFile={setFile2}
              onClear={() => setEditing({ ...editing, image_url2: null })}/>
            <ImageSlot label="รูปที่ 3" current={editing.image_url3} file={file3} setFile={setFile3}
              onClear={() => setEditing({ ...editing, image_url3: null })}/>
          </div>

          <div className="flex gap-2">
            <button disabled={busy} className="bg-emerald-500 text-white px-4 py-2 rounded disabled:opacity-50">
              {busy ? "กำลังบันทึก..." : "บันทึก"}</button>
            <button type="button" onClick={() => { setEditing(null); setFile1(null); setFile2(null); setFile3(null); }}
              className="bg-gray-200 px-4 py-2 rounded">ยกเลิก</button>
          </div>
        </form>
      )}

      <div className="text-xs text-gray-500 mb-2">แสดง {filtered.length} จาก {products.length} รายการ</div>

      <div className="grid gap-2">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-3 rounded-xl shadow flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} className="w-16 h-16 object-contain bg-gray-50 rounded" alt=""/>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-gray-500">{CATEGORIES.find(c => c.id === p.category)?.name}</div>
              <div className="text-emerald-600 font-bold">฿{p.price.toLocaleString()}</div>
            </div>
            <button onClick={() => setEditing(p)} className="text-sm text-blue-500 shrink-0">แก้ไข</button>
            <button onClick={() => del(p.id)} className="text-sm text-red-500 shrink-0">ลบ</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">ไม่พบสินค้าที่ตรงเงื่อนไข</div>}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewSlip, setViewSlip] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState("");

  async function load() {
    const r = await fetch("/api/orders/list");
    const d = await r.json();
    setOrders(d.orders || []);
  }
  useEffect(() => { load(); }, []);

  function copyAddr(text: string) {
    navigator.clipboard.writeText(text);
    alert("คัดลอกแล้ว");
  }

  async function delSlip(id: string) {
    if (!confirm("ลบสลิปออเดอร์นี้?")) return;
    const r = await fetch(`/api/orders?id=${id}&action=clear-slip`, { method: "DELETE" });
    if (r.ok) load(); else alert("ลบไม่สำเร็จ");
  }

  async function delOrder(id: string) {
    if (!confirm("ลบออเดอร์นี้ทั้งหมด?")) return;
    const r = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
    if (r.ok) load(); else alert("ลบไม่สำเร็จ");
  }

  const filtered = useMemo(() =>
    branchFilter ? orders.filter(o => o.branch === branchFilter) : orders
  , [orders, branchFilter]);

  const branchList = useMemo(() =>
    Array.from(new Set(orders.map(o => o.branch).filter(Boolean))) as string[]
  , [orders]);

  function exportCSV() {
    const headers = ["เลขออเดอร์","วันที่สั่ง","ชื่อ","เบอร์","สาขา","จังหวัด","ที่อยู่","สินค้า","ราคา","เวลาโอน"];
    const rows = filtered.map(o => [
      o.order_number || o.id.slice(0,8),
      new Date(o.created_at).toLocaleString("th-TH"),
      o.customer_name, o.phone, o.branch || "",
      o.province || "",
      (o.address || "").replace(/\n/g, " "),
      o.product_name, o.price, o.transfer_time || ""
    ]);
    const csv = [headers, ...rows].map(r =>
      r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <span className="text-sm text-gray-500">แสดง {filtered.length} / {orders.length} ออเดอร์</span>
        <div className="flex gap-2 items-center">
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm">
            <option value="">ทุกสาขา</option>
            {branchList.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={exportCSV}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold">📥 Export CSV</button>
        </div>
      </div>
      <div className="grid gap-2">
        {filtered.map(o => (
          <div key={o.id} className="bg-white p-3 rounded-xl shadow">
            <div className="flex justify-between text-xs text-gray-500">
              <span className="font-bold text-blue-600">{o.order_number || `#${o.id.slice(0, 8)}`}</span>
              <span>{new Date(o.created_at).toLocaleString("th-TH")}</span>
            </div>
            <div className="font-medium mt-1">{o.product_name}</div>
            <div className="text-sm">
              ลูกค้า: <b>{o.customer_name}</b> · โทร: <a className="text-blue-500" href={`tel:${o.phone}`}>{o.phone}</a>
              {o.province && <> · <span className="text-purple-600">{o.province}</span></>}
            </div>
            {o.branch && (
              <div className="text-sm mt-1">🏬 <b className="text-emerald-700">{o.branch}</b></div>
            )}
            {o.address && (
              <div className="mt-2 bg-gray-50 p-2 rounded flex justify-between items-start gap-2">
                <div className="text-xs text-gray-700 whitespace-pre-wrap flex-1">📦 {o.address}</div>
                <button onClick={() => copyAddr(o.address!)} className="text-xs text-blue-500 shrink-0">คัดลอก</button>
              </div>
            )}
            {o.transfer_time && (
              <div className="text-xs text-gray-600 mt-1">⏰ โอนเวลา: {new Date(o.transfer_time).toLocaleString("th-TH")}</div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="text-emerald-600 font-bold">฿{o.price.toLocaleString()}</div>
              <div className="flex gap-2 items-center">
                {o.slip_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.slip_url} alt="slip" onClick={() => setViewSlip(o.slip_url)}
                      className="w-12 h-12 object-cover rounded border cursor-pointer"/>
                    <button onClick={() => delSlip(o.id)} className="text-xs text-orange-500">ลบสลิป</button>
                  </>
                ) : <span className="text-xs text-gray-400">ไม่มีสลิป</span>}
                <button onClick={() => delOrder(o.id)} className="text-xs text-red-500">ลบ</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-500 py-8">ยังไม่มีออเดอร์</div>}
      </div>
      {viewSlip && (
        <div onClick={() => setViewSlip(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewSlip} alt="slip" className="max-w-full max-h-full object-contain"/>
        </div>
      )}
    </div>
  );
}
