"use client";
import { useState } from "react";

const STATUS_MAP: Record<string, { th: string; en: string; color: string }> = {
  pending: { th: "รอตรวจสลิป", en: "Pending", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { th: "ยืนยันแล้ว", en: "Confirmed", color: "bg-blue-100 text-blue-800" },
  shipping: { th: "จัดส่งแล้ว", en: "Shipping", color: "bg-purple-100 text-purple-800" },
  done: { th: "เสร็จสิ้น", en: "Completed", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { th: "ยกเลิก", en: "Cancelled", color: "bg-red-100 text-red-800" }
};

type Order = {
  id: string; order_number: string | null;
  product_name: string; price: number;
  branch: string | null; address: string | null;
  status: string; created_at: string;
  slip_url: string | null;
};

export default function TrackPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setSearched(true);
    const r = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone)}`);
    const d = await r.json();
    setOrders(d.orders || []);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ตรวจสอบออเดอร์</h1>
        <a href="/" className="text-sm text-emerald-600 hover:underline">← หน้าร้าน</a>
      </header>

      <form onSubmit={search} className="bg-white p-4 rounded-2xl shadow mb-4">
        <label className="text-sm text-gray-700">เบอร์โทรศัพท์ที่ใช้สั่งซื้อ</label>
        <div className="flex gap-2 mt-1">
          <input required value={phone} onChange={e => setPhone(e.target.value)}
            pattern="[0-9]{9,10}" inputMode="numeric"
            placeholder="0XXXXXXXXX"
            className="flex-1 border rounded-lg p-2"/>
          <button disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-5 rounded-lg">
            {loading ? "กำลังค้น..." : "ค้นหา"}
          </button>
        </div>
      </form>

      {searched && orders && orders.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          ไม่พบออเดอร์ของเบอร์นี้
        </div>
      )}

      <div className="grid gap-3">
        {orders?.map(o => {
          const st = STATUS_MAP[o.status] || STATUS_MAP.pending;
          return (
            <div key={o.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-blue-600">{o.order_number || `#${o.id.slice(0,8)}`}</div>
                  <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString("th-TH")}</div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}>
                  {st.th}
                </span>
              </div>
              <div className="text-sm font-medium">{o.product_name}</div>
              {o.branch && <div className="text-xs text-gray-600 mt-1">🏬 {o.branch}</div>}
              {o.address && <div className="text-xs text-gray-600 mt-1">📦 {o.address}</div>}
              <div className="flex justify-between items-center mt-2">
                <div className="text-emerald-600 font-bold">฿{o.price.toLocaleString()}</div>
                {o.slip_url && (
                  <a href={o.slip_url} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline">📄 ดูสลิป</a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
