"use client";
import { Product } from "@/lib/types";

export default function ProductCard({ p, onBuy }: { p: Product; onBuy: (p: Product) => void }) {
  const discount = p.old_price && p.old_price > p.price
    ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
    : 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative bg-gray-100 aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-4" />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            {discount}% OFF
          </span>
        )}
      </div>
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
