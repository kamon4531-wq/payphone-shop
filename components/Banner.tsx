"use client";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    title: "iPhone 17 Series",
    subtitle: "เคสคุณภาพพรีเมียม ของแท้ 100%",
    badge: "ช้อปเลย",
    bg: "from-green-700 via-green-500 to-lime-400",
    image: "/slide4.png"
  },
  {
    title: "SUPER CHARGING WEEK",
    subtitle: "หัวชาร์จเร็ว GaN + สายชาร์จเกรดทหาร",
    badge: "เริ่มต้น ฿150",
    bg: "from-emerald-700 via-emerald-500 to-lime-400",
    image: "/slide1.png"
  },
  {
    title: "MAGSAFE COLLECTION",
    subtitle: "เคส MagSafe Premium iPhone 15/16 Pro Max",
    badge: "ลด 51%",
    bg: "from-slate-800 via-slate-600 to-gray-400",
    image: "/slide2.png"
  },
  {
    title: "POWER UP ANYWHERE",
    subtitle: "พาวเวอร์แบงค์ไร้สาย Magnetic 10000mAh",
    badge: "พกพาสะดวก",
    bg: "from-indigo-700 via-purple-600 to-pink-500",
    image: "/slide3.png"
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
    <div className="relative rounded-2xl overflow-hidden h-56 md:h-72">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-all duration-700`}/>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="logo"
        className="absolute top-3 right-3 h-10 md:h-12 z-20 drop-shadow-lg bg-white/90 rounded-md p-1"
        onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>

      <div className="relative z-10 h-full flex items-center">
        <div className="flex-1 p-5 md:p-8 text-white">
          <h2 className="text-xl md:text-3xl font-extrabold tracking-wide drop-shadow-lg">{s.title}</h2>
          <p className="mt-2 text-xs md:text-base opacity-95 max-w-xs drop-shadow">{s.subtitle}</p>
          <div className="mt-3 inline-block bg-black/30 backdrop-blur px-3 py-2 rounded-lg">
            <div className="text-sm font-bold">{s.badge}</div>
          </div>
        </div>
        <div className="w-2/5 md:w-1/2 h-full flex items-center justify-end pr-3 md:pr-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt={s.title}
            className="w-full h-full object-cover drop-shadow-2xl transition-all duration-700"
            onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>
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
