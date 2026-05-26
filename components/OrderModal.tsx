"use client";
import { useState } from "react";
import { Product } from "@/lib/types";

export default function OrderModal({
  product, onClose
}: { product: Product | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
        phone,
        address
      })
    });
    setLoading(false);
    if (r.ok) setDone(true);
    else alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
  }

  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">{showForm ? "สั่งซื้อสินค้า" : "รายละเอียดสินค้า"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold">รับออเดอร์เรียบร้อย!</p>
            <p className="text-sm text-gray-600 mt-2">ทางร้านจะติดต่อกลับโดยเร็ว</p>
            <button onClick={onClose} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg">ปิด</button>
          </div>
        ) : showForm ? (
          <form onSubmit={submit} className="p-4 space-y-3 overflow-y-auto">
            <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image_url} alt="" className="w-16 h-16 object-contain" />
              <div className="flex-1">
                <div className="text-sm font-medium line-clamp-2">{product.name}</div>
                <div className="text-emerald-600 font-bold">฿{product.price.toLocaleString()}</div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input
                required value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1" placeholder="กรอกชื่อ"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input
                required value={phone} onChange={e => setPhone(e.target.value)}
                pattern="[0-9]{9,10}" inputMode="numeric"
                className="w-full border rounded-lg p-2 mt-1" placeholder="0XXXXXXXXX"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">ที่อยู่จัดส่ง <span className="text-red-500">*</span></label>
              <textarea
                required value={address} onChange={e => setAddress(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-2 mt-1 resize-y"
                placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg">← ย้อนกลับ</button>
              <button disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
              >{loading ? "กำลังส่ง..." : "ยืนยันสั่งซื้อ"}</button>
            </div>
          </form>
        ) : (
          <div className="overflow-y-auto">
            <div className="relative bg-gray-50 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4"/>
              {discount > 0 && (
                <span className="absolute top-3 right-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md">
                  {discount}% OFF
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">฿{product.price.toLocaleString()}</span>
                {product.old_price && (
                  <span className="text-sm text-gray-400 line-through">฿{product.old_price.toLocaleString()}</span>
                )}
              </div>
              {product.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-semibold mb-1">รายละเอียดสินค้า</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg"
              >สั่งซื้อสินค้านี้</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
