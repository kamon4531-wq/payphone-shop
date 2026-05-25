"use client";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    title: "SUPER CHARGING WEEK",
    subtitle: "หัวชาร์จเร็ว GaN และสายชาร์จลดพิเศษ เริ่มต้นเพียง ฿150",
    desc: "ลดกระหน่ำหัวชาร์จเร็วและสายชาร์จเกรดทหาร ปลอดภัย ได้มาตรฐาน",
    bg: "from-emerald-700 via-emerald-500 to-lime-400"
  },
  {
    title: "MAGSAFE COLLECTION",
    subtitle: "เคส MagSafe Premium สำหรับ iPhone 15/16 Pro Max",
    desc: "พรีเมียมเกรด ป้องกันการกระแทก ดีไซน์เรียบหรู",
    bg: "from-slate-800 via-slate-600 to-gray-300"
  },
  {
    title: "POWER UP ANYWHERE",
    subtitle: "พาวเวอร์แบงค์ไร้สาย Magnetic 10000mAh",
    desc: "แม่เหล็กบางเฉียบ พกพาสะดวก ชาร์จเร็ว",
    bg: "from-indigo-700 via-purple-600 to-pink-500"
  }
];

export default function Banner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className="relative rounded-2xl overflow-hidden h-56 md:h-64">
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-all duration-700`} />
      <div className="relative z-10 p-6 md:p-8 text-white h-full flex flex-col justify-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide">{s.title}</h2>
        <p className="mt-2 text-sm md:text-base opacity-95">{s.subtitle}</p>
        <div className="mt-3 inline-block bg-black/30 backdrop-blur px-3 py-2 rounded-lg w-fit">
          <div className="text-lg font-bold">{s.title.split(" ").slice(0, 2).join(" ")}</div>
          <div className="text-xs opacity-90">{s.desc}</div>
        </div>
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-2 bg-white/50"}`}
            aria-label={`slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
