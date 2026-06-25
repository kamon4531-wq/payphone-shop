"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const RICH_MENU = [
  { title: "ดูสินค้า",       sub: "เลือกซื้อสินค้าได้ที่นี่",   href: "/shop",     color: "from-emerald-400 to-green-500", icon: "🛒" },
  { title: "สมัครสมาชิก",    sub: "สมัครง่าย ได้สิทธิพิเศษมากมาย", href: "/register", color: "from-blue-500 to-blue-700",     icon: "👤" },
  { title: "โปรโมชั่น",      sub: "ดีลเด็ด ส่วนลดพิเศษ",       href: "/shop",     color: "from-orange-400 to-orange-600", icon: "🎁" },
  { title: "ออเดอร์ของฉัน",  sub: "เช็คสถานะคำสั่งซื้อ",         href: "/track",    color: "from-purple-500 to-purple-700", icon: "📦" },
  { title: "หาสาขา",         sub: "ค้นหาสาขาใกล้คุณ",           href: "/branches", color: "from-pink-500 to-rose-600",     icon: "📍" },
  { title: "ติดต่อสอบถาม",  sub: "แชทสอบถาม 24 ชั่วโมง",       href: "__chat__",  color: "from-cyan-500 to-teal-600",     icon: "💬" },
];

type Msg = { id: string; role: "shop" | "me"; text: string; time: string };
const now = () => new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{
    id: "w", role: "shop",
    text: "🎉 ยินดีต้อนรับสู่ PAY BY PA.PHONE\n\nแหล่งรวมอุปกรณ์มือถือที่ดีที่สุด\n\nเลือกเมนูด้านล่าง หรือพิมพ์ข้อความสอบถามได้เลย 👇",
    time: now(),
  }]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, menuOpen]);

  function openChat() {
    setMenuOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }
  function send() {
    if (!msg.trim()) return;
    const t = msg.trim();
    setMessages(m => [...m, { id: Date.now()+"u", role: "me", text: t, time: now() }]);
    setMsg("");
    setTimeout(() => {
      setMessages(m => [...m, { id: Date.now()+"s", role: "shop", text: "ขอบคุณที่ติดต่อค่ะ พนักงานสาขาจะตอบกลับเร็วๆ นี้ 🙏", time: now() }]);
    }, 800);
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-emerald-50">
      <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="PA" className="w-10 h-10 rounded-full bg-white object-contain shadow"/>
        <div className="flex-1">
          <div className="font-bold text-base leading-tight">PAY BY PA.PHONE</div>
          <div className="text-xs opacity-90">● ออนไลน์ พร้อมตอบ</div>
        </div>
        <a href="/admin" className="text-xs bg-white/20 px-2 py-1 rounded">Login</a>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#8fb8d4]">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
            {m.role === "shop" && (
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mr-2 self-end font-bold">PA</div>
            )}
            <div className={`max-w-[78%] ${m.role === "me" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-line shadow ${m.role === "me" ? "bg-emerald-400 text-black rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm"}`}>
                {m.text}
              </div>
              <div className="text-[10px] text-white/80 mt-0.5 px-1">{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      {menuOpen ? (
        <div className="bg-white border-t shadow-2xl">
          <div className="grid grid-cols-2 gap-2 p-3">
            {RICH_MENU.map(b => (
              b.href === "__chat__" ? (
                <button key={b.title} onClick={openChat} className={`bg-gradient-to-br ${b.color} text-white rounded-2xl py-4 px-3 text-left active:scale-95 transition shadow`}>
                  <div className="text-3xl mb-1">{b.icon}</div>
                  <div className="text-sm font-bold leading-tight">{b.title}</div>
                  <div className="text-[10px] opacity-90 leading-tight mt-0.5">{b.sub}</div>
                </button>
              ) : (
                <Link key={b.title} href={b.href} className={`bg-gradient-to-br ${b.color} text-white rounded-2xl py-4 px-3 text-left active:scale-95 transition shadow`}>
                  <div className="text-3xl mb-1">{b.icon}</div>
                  <div className="text-sm font-bold leading-tight">{b.title}</div>
                  <div className="text-[10px] opacity-90 leading-tight mt-0.5">{b.sub}</div>
                </Link>
              )
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border-t bg-gray-50">
            <button onClick={openChat} className="w-9 h-9 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300" title="พิมพ์ข้อความ">⌨️</button>
            <button onClick={() => setMenuOpen(false)} className="flex-1 text-gray-700 text-sm font-bold py-2 text-center hover:bg-gray-100 rounded">Menu ▼</button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-t">
          <div className="flex items-center gap-2 p-2">
            <button onClick={() => setMenuOpen(true)} className="w-10 h-10 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center" title="เปิดเมนู">▲</button>
            <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"/>
            <button onClick={send} disabled={!msg.trim()} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-50">➤</button>
          </div>
        </div>
      )}
    </div>
  );
}
