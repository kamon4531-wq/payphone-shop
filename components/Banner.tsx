"use client";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    title: "SUPER CHARGING WEEK",
    subtitle: "หัวชาร์จเร็ว GaN + สายชาร์จเกรดทหาร",
    badge: "เริ่มต้น ฿150",
    bg: "from-emerald-700 via-emerald-500 to-lime-400",
    icon: (
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <rect x="65" y="40" width="70" height="100" rx="12" fill="#1f2937"/>
        <rect x="75" y="55" width="50" height="35" rx="4" fill="#fbbf24"/>
        <text x="100" y="78" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">GaN</text>
        <rect x="85" y="100" width="8" height="25" fill="#9ca3af"/>
        <rect x="107" y="100" width="8" height="25" fill="#9ca3af"/>
        <rect x="85" y="140" width="4" height="20" fill="#6b7280"/>
        <rect x="111" y="140" width="4" height="20" fill="#6b7280"/>
        <path d="M 145 60 L 165 60 L 155 80 L 175 80 L 145 115 L 155 90 L 140 90 Z" fill="#fde047" stroke="#facc15" strokeWidth="2"/>
      </svg>
    )
  },
  {
    title: "MAGSAFE COLLECTION",
    subtitle: "เคส MagSafe Premium iPhone 15/16 Pro Max",
    badge: "ลด 51%",
    bg: "from-slate-800 via-slate-600 to-gray-400",
    icon: (
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <rect x="60" y="20" width="80" height="160" rx="18" fill="#d4b896" stroke="#1f2937" strokeWidth="3"/>
        <rect x="70" y="32" width="60" height="100" rx="6" fill="#0f172a"/>
        <circle cx="100" cy="95" r="22" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4 3"/>
        <circle cx="100" cy="95" r="14" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
        <circle cx="78" cy="42" r="3" fill="#1e293b"/>
        <circle cx="86" cy="42" r="3" fill="#1e293b"/>
      </svg>
    )
  },
  {
    title: "POWER UP ANYWHERE",
    subtitle: "พาวเวอร์แบงค์ไร้สาย Magnetic 10000mAh",
    badge: "พกพาสะดวก",
    bg: "from-indigo-700 via-purple-600 to-pink-500",
    icon: (
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <rect x="55" y="50" width="90" height="110" rx="14" fill="#1f2937"/>
        <rect x="62" y="58" width="76" height="60" rx="6" fill="#374151"/>
        <text x="100" y="92" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">PAY</text>
        <text x="100" y="108" textAnchor="middle" fill="#a78bfa" fontSize="10">10000mAh</text>
        <circle cx="78" cy="138" r="4" fill="#22c55e"/>
        <circle cx="92" cy="138" r="4" fill="#22c55e"/>
        <circle cx="106" cy="138" r="4" fill="#22c55e"/>
        <circle cx="120" cy="138" r="4" fill="#6b7280"/>
        <circle cx="100" cy="35" r="8" fill="none" stroke="#fde047" strokeWidth="2"/>
        <path d="M 95 30 L 100 25 L 105 30 L 102 35 L 100 33 L 98 35 Z" fill="#fde047"/>
      </svg>
    )
  }
];

export default function Banner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className="relative rounded-2xl overflow-hidden h-56 md:h-64">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-all duration-700`}/>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="logo"
        className="absolute top-3 right-3 h-10 md:h-12 z-20 drop-shadow-lg bg-white/90 rounded-md p-1"
        onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>

      <div className="relative z-10 h-full flex items-center">
        <div className="flex-1 p-5 md:p-8 text-white">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-wide drop-shadow">{s.title}</h2>
          <p className="mt-2 text-xs md:text-base opacity-95 max-w-xs">{s.subtitle}</p>
          <div className="mt-3 inline-block bg-black/30 backdrop-blur px-3 py-2 rounded-lg">
            <div className="text-sm font-bold">{s.badge}</div>
          </div>
        </div>
        <div className="w-1/3 md:w-2/5 h-full flex items-center justify-center p-3 md:p-4">
          {s.icon}
        </div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`slide ${idx + 1}`}/>
        ))}
      </div>
    </div>
  );
}
