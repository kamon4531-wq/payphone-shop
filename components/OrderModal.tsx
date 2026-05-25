"use client";
import { useState } from "react";
import { Product } from "@/lib/types";

export default function OrderModal({
  product, onClose
}: { product: Product | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!product) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product!.id,
        product_name: product!.name,
        price: product!.price,
        customer_name: name,
        phone
      })
    });
    setLoading(false);
    if (r.ok) setDone(true);
    else alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">สั่งซื้อสินค้า</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>
        {done ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold">รับออเดอร์เรียบร้อย!</p>
            <p className="text-sm text-gray-600 mt-2">ทางร้านจะติดต่อกลับโดยเร็ว</p>
            <button onClick={onClose} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg">ปิด</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-4 space-y-3">
            <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image_url} alt="" className="w-16 h-16 object-contain" />
              <div className="flex-1">
                <div className="text-sm font-medium line-clamp-2">{product.name}</div>
                <div className="text-emerald-600 font-bold">฿{product.price.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">ชื่อ-นามสกุล</label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1" placeholder="กรอกชื่อ"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">เบอร์โทรศัพท์</label>
              <input
                required value={phone} onChange={e => setPhone(e.target.value)}
                pattern="[0-9]{9,10}" inputMode="numeric"
                className="w-full border rounded-lg p-2 mt-1" placeholder="0XXXXXXXXX"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
            >{loading ? "กำลังส่ง..." : "ยืนยันสั่งซื้อ"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
