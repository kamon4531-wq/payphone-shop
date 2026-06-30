"use client";
import { useState } from "react";
import { Product } from "@/lib/types";

function optImg(url: string, w: number) {
  if (!url) return "";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`).replace(/\.(png|jpe?g|webp|jxl|gif|avif)$/i, "");
  }
  return url;
}

export default function ProductCard({ p, onBuy, onAdd }: { p: Product; onBuy: (p: Product) => void; onAdd?: (p: Product) => void }) {
  const discount = p.old_price && p.old_price > p.price
    ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
    : 0;
  const badge = p.badge_text && p.badge_text !== "null" ? p.badge_text : null;

  const images = [p.image_url, p.image_url2, p.image_url3].filter(Boolean) as string[];
  const [mainImg, setMainImg] = useState(images[0]);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative bg-gray-100 aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={optImg(mainImg, 400)} alt={p.name}
          loading="lazy"
          className="w-full h-full object-contain p-4" />
        {badge && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {badge}
          </span>
        )}
        {discount > 0 && !badge && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1 px-3 pt-2 justify-center">
          {images.map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={idx} src={optImg(img, 80)} alt={`${idx+1}`}
              loading="lazy"
              onClick={() => setMainImg(img)}
              className={`w-10 h-10 object-contain border-2 rounded cursor-pointer bg-gray-50 ${mainImg===img?"border-emerald-500":"border-gray-200"}`}/>
          ))}
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-emerald-600">฿{p.price.toLocaleString()}</span>
          {p.old_price && (
            <span className="text-xs text-gray-400 line-through">฿{p.old_price.toLocaleString()}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onBuy(p)}
            className="flex-1 bg-black hover:bg-gray-800 text-white text-sm rounded-lg py-2 font-medium"
          >
            รายละเอียด
          </button>
          {onAdd && (
            <button
              onClick={() => onAdd(p)}
              title="ใส่ตะกร้า"
              aria-label="ใส่ตะกร้า"
              className="rounded-lg px-3 flex items-center justify-center active:scale-95 transition"
              style={{ backgroundColor: "#ee4d2d" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v0M9 19a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
