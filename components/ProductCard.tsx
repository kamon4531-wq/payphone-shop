"use client";
import { useState, useRef, useEffect } from "react";
import { Product } from "@/lib/types";

export default function ProductCard({ p, onBuy }: { p: Product; onBuy: (p: Product) => void }) {
  const discount = p.old_price && p.old_price > p.price
    ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
    : 0;

  const images = [p.image_url, p.image_url2, p.image_url3].filter(x => x && x !== "null") as string[];
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startSlide() {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImgIdx(i => (i + 1) % images.length);
    }, 800);
  }

  function stopSlide() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setImgIdx(0);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div
        className="relative bg-gray-100 aspect-square overflow-hidden cursor-pointer"
        onMouseEnter={startSlide}
        onMouseLeave={stopSlide}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[imgIdx]}
          alt={p.name}
          className="w-full h-full object-contain p-4 transition-all duration-300"
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
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === imgIdx ? "w-4 bg-emerald-500" : "w-1.5 bg-gray-400"}`}/>
            ))}
          </div>
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
