"use client";
import { useEffect, useState } from "react";
import { Product, THAI_PROVINCES, BRANCHES } from "@/lib/types";

export default function OrderModal({
  product, onClose
}: { product: Product | null; onClose: () => void }) {
  const [step, setStep] = useState<"detail"|"info"|"pay"|"done">("detail");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [branch, setBranch] = useState("");
  const [transferTime, setTransferTime] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0 });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("selectedBranch") : null;
    if (saved) setBranch(saved);
  }, []);

  if (!product) return null;

  const images = [product.image_url, product.image_url2, product.image_url3].filter(Boolean) as string[];
  const badge = product.badge_text && product.badge_text !== "null" ? product.badge_text : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slipFile) { alert("กรุณาอัพโหลดสลิป"); return; }
    setLoading(true);
    const fd = new FormData(); fd.append("file", slipFile);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) { alert("อัพโหลดสลิปล้มเหลว"); setLoading(false); return; }
    const slipData = await up.json();

    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product!.id,
        product_name: product!.name,
        price: product!.price,
        customer_name: name,
        phone, address, province, branch,
        transfer_time: transferTime,
        slip_url: slipData.url,
        slip_id: slipData.id
      })
    });
    setLoading(false);
    if (r.ok) setStep("done"); else alert("เกิดข้อผิดพลาด");
  }

  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ show: true, x, y });
  }

  const regions = ["R1","R2","R3","R4"];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">
            {step==="detail" && "รายละเอียดสินค้า"}
            {step==="info" && "ข้อมูลผู้สั่งซื้อ"}
            {step==="pay" && "ชำระเงิน"}
            {step==="done" && "สั่งซื้อสำเร็จ"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {step==="done" && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold">ขอบคุณสำหรับการสั่งซื้อ!</p>
            <p className="text-sm text-gray-600 mt-2">ทางร้านจะตรวจสอบสลิปและติดต่อกลับ</p>
            <button onClick={onClose} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg">ปิด</button>
          </div>
        )}

        {step==="detail" && (
          <div className="overflow-y-auto">
            <div
              className="relative bg-gray-50 h-64 md:h-72 overflow-hidden cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoom({ show: false, x: 0, y: 0 })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[imgIdx]} alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-200"
                style={zoom.show ? {
                  transform: `scale(2)`,
                  transformOrigin: `${zoom.x}% ${zoom.y}%`
                } : {}}/>
              {badge && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow-lg z-10">
                  {badge}
                </span>
              )}
              {discount>0 && !badge && (
                <span className="absolute top-3 right-3 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-md z-10">
                  {discount}% OFF
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 shadow z-10">‹</button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 shadow z-10">›</button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 justify-center border-b">
                {images.map((img, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={idx} src={img} alt={`${idx+1}`}
                    onClick={() => setImgIdx(idx)}
                    className={`w-14 h-14 object-contain border-2 rounded cursor-pointer ${idx===imgIdx?"border-emerald-500":"border-gray-200"}`}/>
                ))}
              </div>
            )}
            <div className="p-4 space-y-3">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-600">฿{product.price.toLocaleString()}</span>
                {product.old_price && <span className="text-sm text-gray-400 line-through">฿{product.old_price.toLocaleString()}</span>}
                {discount>0 && badge && (
                  <span className="text-xs text-orange-500 font-bold">ลด {discount}%</span>
                )}
              </div>
              {product.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-semibold
