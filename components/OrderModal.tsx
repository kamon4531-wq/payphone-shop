"use client";
import { useEffect, useState } from "react";
import { Product, THAI_PROVINCES, BRANCHES } from "@/lib/types";
import { useLang } from "@/lib/i18n";

function optImg(url: string, w: number) {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`);
  }
  return url;
}

export default function OrderModal({
  product, onClose
}: { product: Product | null; onClose: () => void }) {
  const { t, provName } = useLang();
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
  const currentImg = images[imgIdx];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!slipFile) { alert(t("uploadSlip")); return; }
    setLoading(true);
    const fd = new FormData(); fd.append("file", slipFile);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) { alert("Upload failed"); setLoading(false); return; }
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
    if (r.ok) setStep("done"); else alert("Error");
  }

  const discount = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ show: true, x, y });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">
            {step==="detail" && t("productDetails")}
            {step==="info" && t("buyerInfo")}
            {step==="pay" && t("payment")}
            {step==="done" && t("orderSuccess")}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
        </div>

        {step==="done" && (
          <div className="p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold">{t("thankYou")}</p>
            <p className="text-sm text-gray-600 mt-2">{t("willContact")}</p>
            <button onClick={onClose} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg">{t("close")}</button>
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
              <img src={zoom.show ? optImg(currentImg, 1200) : optImg(currentImg, 600)} alt={product.name}
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
                  <img key={idx} src={optImg(img, 150)} alt={`${idx+1}`}
                    loading="lazy"
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
              </div>
              {product.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-semibold mb-1">{t("description")}</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
              <button onClick={()=>setStep("info")}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">
                {t("orderProduct")}
              </button>
            </div>
          </div>
        )}

        {step==="info" && (
          <form onSubmit={e=>{e.preventDefault(); setStep("pay");}} className="p-4 space-y-3 overflow-y-auto">
            <div>
              <label className="text-sm text-gray-700">{t("fullName")} <span className="text-red-500">*</span></label>
              <input required value={name} onChange={e=>setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"/>
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("phone")} <span className="text-red-500">*</span></label>
              <input required value={phone} onChange={e=>setPhone(e.target.value)}
                pattern="[0-9]{9,10}" inputMode="numeric"
                className="w-full border rounded-lg p-2 mt-1" placeholder="0XXXXXXXXX"/>
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("branch")} <span className="text-red-500">*</span></label>
              <input required type="text" list="branchList" value={branch}
                onChange={e=>setBranch(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder={t("searchBranch")}/>
              <datalist id="branchList">
                {BRANCHES.map(b => <option key={b.name} value={b.name}/>)}
              </datalist>
              {branch && <div className="text-xs text-emerald-600 mt-1">✓ {branch}</div>}
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("province")} <span className="text-red-500">*</span></label>
              <select required value={province} onChange={e=>setProvince(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1">
                <option value="">{t("selectProvince")}</option>
                {THAI_PROVINCES.map(p=> <option key={p} value={p}>{provName(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("address")} <span className="text-red-500">*</span></label>
              <textarea required value={address} onChange={e=>setAddress(e.target.value)} rows={4}
                className="w-full border rounded-lg p-2 mt-1 resize-y"
                placeholder={t("addressPlaceholder")}/>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setStep("detail")}
                className="flex-1 bg-gray-200 py-3 rounded-lg">{t("back")}</button>
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">
                {t("proceedPayment")}
              </button>
            </div>
          </form>
        )}

        {step==="pay" && (
          <form onSubmit={submit} className="p-4 space-y-3 overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600">{t("amountToTransfer")}</div>
              <div className="text-2xl font-bold text-emerald-600">฿{product.price.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-sm font-semibold mb-2">{t("scanQR")}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr.jpg" alt="QR" className="mx-auto max-w-[220px] w-full"
                onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>
              <div className="text-xs text-gray-500 mt-2">PromptPay</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("transferTime")} <span className="text-red-500">*</span></label>
              <input required type="datetime-local" value={transferTime}
                onChange={e=>setTransferTime(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"/>
            </div>
            <div>
              <label className="text-sm text-gray-700">{t("uploadSlip")} <span className="text-red-500">*</span></label>
              <input required type="file" accept="image/*"
                onChange={e=>setSlipFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2 mt-1"/>
              {slipFile && <div className="text-xs text-green-600 mt-1">✓ {slipFile.name}</div>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setStep("info")}
                className="flex-1 bg-gray-200 py-3 rounded-lg">{t("back")}</button>
              <button disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg">
                {loading ? t("sending") : t("confirmOrder")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
