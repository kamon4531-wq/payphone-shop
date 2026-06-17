"use client";
import { useEffect, useState } from "react";

const SLIDES = ["/banner1.png", "/banner2.png", "/banner3.png"];

export default function Banner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100">
      <div className="aspect-[16/6] md:aspect-[16/5]">
        {SLIDES.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`banner ${idx+1}`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "opacity-0"
            }`}
            onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}}/>
        ))}
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-emerald-500" : "w-2 bg-gray-300"}`}
            aria-label={`slide ${idx + 1}`}/>
        ))}
      </div>
    </div>
  );
}
