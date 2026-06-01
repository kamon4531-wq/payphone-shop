"use client";
import { useState } from "react";
import { Product } from "@/lib/types";

export default function ProductCard({ p, onBuy }: { p: Product; onBuy: (p: Product) => void }) {
  const discount = p.old_price && p.old_price > p.price
    ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
    : 0;

  const images = [p.image_url, p.image_url2, p.image_url3].filter(Boolean) as string[];
  const [imgIdx, setImgIdx] = useState(0);
  const [zoom, setZoom] = useState({ show: false, x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ show: true, x, y });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div
        className="relative bg-gray-100 aspect-square overflow-hidden cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoom({ show: false, x: 0, y: 0 })}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[imgIdx]}
          alt={p.name}
          className="w-full h-full object-contain p-4 transition-transform duration-200"
          style={zoom.show ? {
            transform: `scale(2.2)`,
            transformOrigin: `${zoom.x}% ${zoom.y}%`
          } : {}}
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            {discount}% OFF
          </span>
        )}
        {p.badge_text && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            {p.badge_text}
          </span>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 shadow z-10 text-sm">‹</button>
            <button
              onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 shadow z-10 text-sm">›</button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-1 px-2 py-1 justify-center border-b">
          {images.map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={img}
              alt={`${idx + 1}`}
              onClick={() => setImgIdx(idx)}
              className={`w-10 h-10 object-contain border-2 rounded cursor-pointer ${idx === imgIdx ? "border-emerald-500" : "border-gray-200"}`}
            />
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
        <button
          onClick={() => onBuy(p)}
          className="mt-3 bg-black hover:bg-gray-800 text-white text-sm rounded-lg py-2 font-medium"
        >
          ดูรายละเอียด / สั่งซื้อ
        </button>
      </div>
    </div>
  );
}
