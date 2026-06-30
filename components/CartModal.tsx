"use client";
import { useEffect, useMemo, useState } from "react";
import { Product, THAI_PROVINCES, BRANCHES } from "@/lib/types";
import { useLang } from "@/lib/i18n";

export type CartItem = { p: Product; qty: number };

function optImg(url: string, w: number) {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`).replace(/\.(png|jpe?g|webp|jxl|gif|avif)$/i, "");
  }
  return url;
}

function shippingFee(subtotal: number): number {
  return subtotal >= 200 ? 0 : 15;
}

export default function CartModal({
  items, onClose, setQty, removeItem, clearCart
}: {
  items: CartItem[];
  onClose: () => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}) {
  const { provName } = useLang();
  const [step, setStep] = useState<"cart"|"info"|"pay"|"done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [branch, setBranch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [transferTime, setTransferTime] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("selectedBranch") : null;
    if (saved) { setBranch(saved); setBranchSearch(saved); }
  }, []);

  const filteredBranches = useMemo(() => {
    if (!branchSearch) return BRANCHES;
    const q = branchSearch.toLowerCase();
    return BRANCHES.filter(b => b.name.toLowerCase().includes(q));
  }, [branchSearch]);

  const filteredProvinces = useMemo(() => {
    if (!provinceSearch) return THAI_PROVINCES;
    const q = provinceSearch.toLowerCase();
    return THAI_PROVINCES.filter(p => p.toLowerCase().includes(q) || provName(p).toLowerCase().includes(q));
  }, [provinceSearch, provName]);

  const subtotal = items.reduce((s, it) => s + it.p.price * it.qty, 0);
  const ship = shippingFee(subtotal);
  const total = subtotal + ship;
  const totalQty = items.reduce((s, it) => s + it.qty, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slipFile) { alert("กรุณาแนบสลิป"); return; }
    if (!branch) { alert("กรุณาเลือกสาขา"); return; }
    if (!province) { alert("กรุณาเลือกจังหวัด"); return; }
    setLoading(true);
    const fd = new FormData(); fd.append("file", slipFile);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) { alert("อัปโหลดสลิปไม่สำเร็จ"); setLoading(false); return; }
    const slipData = await up.json();

    const summary = `🛒 ${totalQty} ชิ้น (${items.length} รายการ):\n` +
      items.map(it => `- ${it.p.name} x${it.qty} = ฿${(it.p.price * it.qty).toLocaleString()}`).join("\n") +
      `\nรวมสินค้า ฿${subtotal.toLocaleString()} + ค่าส่ง ฿${ship} = ฿${total.toLocaleString()}`;

    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: items[0].p.id,
        product_name: summary,
        price: subtotal,
        customer_name: name,
        phone, address, province, branch,
        transfer_time: transferTime,
        slip_url: slipData.url,
        slip_id: slipData.id
      })
    });
    setLoading(false);
    if (r.ok) { clearCart(); setStep("done"); } else alert("เกิดข้อผิดพลาด");
  }

  function selectBranch(n: string) { setBranch(n); setBranchSearch(n); setBranchOpen(false); }
  function selectProvince(p: string) { setProvince(p); setProvinceSearch(provName(p)); setProvinceOpen(false); }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">
            {step==="cart" && `🛒 ตะกร้า (${totalQty} ชิ้น)`}
            {step==="info" && "ข้อมูลผู้ซื้อ"}
            {step==="pay" && "ชำระเงิน"}
            {step==="done" && "สั่งซื้อสำเร็จ"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {step==="done" && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold">ขอบคุณสำหรับการสั่งซื้อ</p>
            <p className="text-sm text-gray-600 mt-2">ทางร้านจะติดต่อกลับโดยเร็ว</p>
            <button onClick={onClose} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg">ปิด</button>
          </div>
        )}

        {step==="cart" && (
          <div className="overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8">ตะกร้าว่าง</div>
            ) : (
              <>
                {items.map(it => (
                  <div key={it.p.id} className="flex items-center gap-3 border-b pb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={optImg(it.p.image_url, 80)} alt={it.p.name} className="w-14 h-14 object-contain bg-gray-50 rounded shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">{it.p.name}</div>
                      <div className="text-emerald-600 font-bold text-sm">฿{it.p.price.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={()=>setQty(it.p.id, it.qty-1)} className="w-7 h-7 rounded bg-gray-200 font-bold">−</button>
                      <span className="w-7 text-center">{it.qty}</span>
                      <button onClick={()=>setQty(it.p.id, it.qty+1)} className="w-7 h-7 rounded bg-gray-200 font-bold">+</button>
                      <button onClick={()=>removeItem(it.p.id)} className="text-red-500 text-xs ml-1">ลบ</button>
                    </div>
                  </div>
                ))}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm text-gray-700"><span>รวมสินค้า</span><span>฿{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-gray-700"><span>ค่าจัดส่ง</span><span>{ship===0?"ส่งฟรี 🎉":`฿${ship}`}</span></div>
                  <div className="flex justify-between items-center border-t border-emerald-200 pt-2 mt-1"><span className="font-semibold">ยอดที่ต้องโอน</span><span className="text-2xl font-bold text-emerald-600">฿{total.toLocaleString()}</span></div>
                  {ship>0 && <div className="text-xs text-orange-500 text-center pt-1">💡 ซื้อเพิ่มอีก ฿{(200-subtotal).toLocaleString()} ส่งฟรี!</div>}
                </div>
                <button onClick={()=>setStep("info")} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">ดำเนินการสั่งซื้อ</button>
              </>
            )}
          </div>
        )}

        {step==="info" && (
          <form onSubmit={e=>{e.preventDefault(); if(!branch){alert("กรุณาเลือกสาขา"); return;} if(!province){alert("กรุณาเลือกจังหวัด"); return;} setStep("pay");}} className="p-4 space-y-3 overflow-y-auto">
            <div>
              <label className="text-sm text-gray-700">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-lg p-2 mt-1"/>
            </div>
            <div>
              <label className="text-sm text-gray-700">เบอร์โทร <span className="text-red-500">*</span></label>
              <input required value={phone} onChange={e=>setPhone(e.target.value)} pattern="[0-9]{9,10}" inputMode="numeric" className="w-full border rounded-lg p-2 mt-1" placeholder="0XXXXXXXXX"/>
            </div>
            <div className="relative">
              <label className="text-sm text-gray-700">สาขา <span className="text-red-500">*</span></label>
              <input type="text" value={branchSearch}
                onChange={e => { setBranchSearch(e.target.value); setBranch(""); setBranchOpen(true); }}
                onFocus={() => setBranchOpen(true)}
                onBlur={() => setTimeout(() => setBranchOpen(false), 200)}
                className="w-full border rounded-lg p-2 mt-1" placeholder="🔍 พิมพ์ค้นหาสาขา"/>
              {branchOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg z-20">
                  {filteredBranches.length > 0 ? filteredBranches.map(b => (
                    <div key={b.name} onMouseDown={() => selectBranch(b.name)} className="p-2 text-sm hover:bg-emerald-50 cursor-pointer border-b">
                      <span className="text-xs text-gray-500 mr-2">{b.region}</span>{b.name}
                    </div>
                  )) : (<div className="p-3 text-sm text-gray-500 text-center">ไม่พบสาขา</div>)}
                </div>
              )}
              {branch && <div className="text-xs text-emerald-600 mt-1">✓ {branch}</div>}
            </div>
            <div className="relative">
              <label className="text-sm text-gray-700">จังหวัด <span className="text-red-500">*</span></label>
              <input type="text" value={provinceSearch}
                onChange={e => { setProvinceSearch(e.target.value); setProvince(""); setProvinceOpen(true); }}
                onFocus={() => setProvinceOpen(true)}
                onBlur={() => setTimeout(() => setProvinceOpen(false), 200)}
                className="w-full border rounded-lg p-2 mt-1" placeholder="🔍 พิมพ์ค้นหาจังหวัด"/>
              {provinceOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg z-20">
                  {filteredProvinces.length > 0 ? filteredProvinces.map(p => (
                    <div key={p} onMouseDown={() => selectProvince(p)} className="p-2 text-sm hover:bg-emerald-50 cursor-pointer border-b">{provName(p)}</div>
                  )) : (<div className="p-3 text-sm text-gray-500 text-center">ไม่พบจังหวัด</div>)}
                </div>
              )}
              {province && <div className="text-xs text-emerald-600 mt-1">✓ {provName(province)}</div>}
            </div>
            <div>
              <label className="text-sm text-gray-700">ที่อยู่จัดส่ง <span className="text-red-500">*</span></label>
              <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows={4} className="w-full border rounded-lg p-2 mt-1 resize-y" placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ รหัสไปรษณีย์"/>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setStep("cart")} className="flex-1 bg-gray-200 py-3 rounded-lg">ย้อนกลับ</button>
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">ไปชำระเงิน</button>
            </div>
          </form>
        )}

        {step==="pay" && (
          <form onSubmit={submit} className="p-4 space-y-3 overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-700"><span>รวมสินค้า ({totalQty} ชิ้น)</span><span>฿{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-gray-700"><span>ค่าจัดส่ง</span><span>{ship===0?"ส่งฟรี 🎉":`฿${ship}`}</span></div>
              <div className="flex justify-between items-center border-t border-emerald-200 pt-2 mt-1"><span className="font-semibold">ยอดที่ต้องโอน</span><span className="text-2xl font-bold text-emerald-600">฿{total.toLocaleString()}</span></div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm font-semibold mb-2">สแกนจ่าย</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr.jpg" alt="QR" className="mx-auto max-w-[220px] w-full" onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>
              <div className="text-xs text-gray-500 mt-2">PromptPay</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">เวลาที่โอน <span className="text-red-500">*</span></label>
              <input required type="datetime-local" value={transferTime} onChange={e=>setTransferTime(e.target.value)} className="w-full border rounded-lg p-2 mt-1"/>
            </div>
            <div>
              <label className="text-sm text-gray-700">แนบสลิป <span className="text-red-500">*</span></label>
              <input required type="file" accept="image/*" onChange={e=>setSlipFile(e.target.files?.[0] || null)} className="w-full border rounded-lg p-2 mt-1"/>
              {slipFile && <div className="text-xs text-green-600 mt-1">✓ {slipFile.name}</div>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setStep("info")} className="flex-1 bg-gray-200 py-3 rounded-lg">ย้อนกลับ</button>
              <button disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg">{loading ? "กำลังส่ง..." : "ยืนยันสั่งซื้อ"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
