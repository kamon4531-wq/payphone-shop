"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RICH_MENU = [
  { title: "ดูสินค้า",       sub: "เลือกซื้อสินค้าได้ที่นี่",   href: "/shop",     color: "from-emerald-400 to-green-500", icon: "🛒" },
  { title: "สมัครสมาชิก",    sub: "สมัครง่าย ได้สิทธิพิเศษมากมาย", href: "/register", color: "from-blue-500 to-blue-700",     icon: "👤" },
  { title: "โปรโมชั่น",      sub: "ดีลเด็ด ส่วนลดพิเศษ",       href: "/shop",     color: "from-orange-400 to-orange-600", icon: "🎁" },
  { title: "ออเดอร์ของฉัน",  sub: "เช็คสถานะคำสั่งซื้อ",         href: "/track",    color: "from-purple-500 to-purple-700", icon: "📦" },
  { title: "หาสาขา",         sub: "ค้นหาสาขาใกล้คุณ",           href: "/branches", color: "from-pink-500 to-rose-600",     icon: "📍" },
  { title: "ติดต่อสอบถาม",  sub: "แชทสอบถาม 24 ชั่วโมง",       href: "/contact",  color: "from-cyan-500 to-teal-600",     icon: "💬" },
];

type MentionedProduct = { id: string; name: string; price: number; old_price: number | null };
type Msg = { id: string; role: "shop" | "me"; text: string; time: string; products?: MentionedProduct[] };
const now = () => new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{
    id: "w", role: "shop",
    text: "🎉 ยินดีต้อนรับสู่ PAY BY PA.PHONE\n\n🤖 มีผู้ช่วย AI พร้อมแนะนำสินค้า — พิมพ์ถามได้เลย เช่น\n• \"อยากได้พาวเวอร์แบงค์ iPhone งบ 900\"\n• \"แนะนำเคส iPhone 15 ที่กันกระแทก\"",
    time: now(),
  }]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;
    setIsIOS(/iPhone|iPad|iPod/.test(window.navigator.userAgent));
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => { window.removeEventListener("beforeinstallprompt", handler); };
  }, []);

  async function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowInstall(false);
      setDeferredPrompt(null);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, menuOpen]);

  async function send() {
    if (!msg.trim() || sending) return;
    const userText = msg.trim();
    setMsg("");
    setSending(true);

    const userMsg: Msg = { id: Date.now()+"u", role: "me", text: userText, time: now() };
    setMessages(m => [...m, userMsg]);

    // Build history for context
    const history = messages.filter(m => m.id !== "w").map(m => ({
      role: m.role === "me" ? "user" : "assistant",
      text: m.text
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history })
      });
      const data = await res.json();
      const reply = data.ok ? data.reply : "ขออภัย เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
      setMessages(m => [...m, {
        id: Date.now()+"s",
        role: "shop",
        text: reply,
        time: now(),
        products: data.products || []
      }]);
    } catch {
      setMessages(m => [...m, {
        id: Date.now()+"s", role: "shop",
        text: "ขออภัย ระบบขัดข้อง ลองใหม่อีกครั้งค่ะ",
        time: now()
      }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-emerald-50">
      {showInstall && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="PA.PHONE" className="w-20 h-20 mx-auto object-contain"/>
              <h2 className="text-xl font-bold mt-2 text-gray-900">ติดตั้งแอป PA.PHONE</h2>
              <p className="text-sm text-gray-600 mt-1">เพิ่มลงหน้าจอมือถือ ใช้งานสะดวกเหมือนแอปจริง</p>
            </div>
            {isIOS ? (
              <div className="bg-blue-50 rounded-2xl p-4 text-sm text-gray-800 space-y-2 leading-relaxed">
                <div className="font-bold text-blue-700">📱 สำหรับ iPhone (Safari):</div>
                <div>1. กดปุ่ม <b>Share</b> ⬆️ ด้านล่างของ Safari</div>
                <div>2. เลื่อนหา <b>"เพิ่มลงในหน้าจอโฮม"</b></div>
                <div>3. กด <b>"เพิ่ม"</b> มุมขวาบน</div>
              </div>
            ) : deferredPrompt ? (
              <button onClick={installApp} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 rounded-2xl shadow active:scale-95 transition">
                📲 ติดตั้งแอปทันที
              </button>
            ) : (
              <div className="bg-blue-50 rounded-2xl p-4 text-sm text-gray-800 space-y-2 leading-relaxed">
                <div className="font-bold text-blue-700">📱 สำหรับ Android (Chrome):</div>
                <div>1. กดปุ่ม <b>⋮</b> มุมขวาบน</div>
                <div>2. เลือก <b>"ติดตั้งแอป"</b></div>
              </div>
            )}
            <button onClick={() => setShowInstall(false)} className="w-full mt-4 text-gray-500 text-sm py-2 hover:text-gray-700">
              ใช้งานบนเว็บก่อน
            </button>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 flex items-center gap-3 shadow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="PA" className="w-10 h-10 rounded-full bg-white object-contain shadow"/>
        <div className="flex-1">
          <div className="font-bold text-base leading-tight">PAY BY PA.PHONE</div>
          <div className="text-xs opacity-90">🤖 ผู้ช่วย AI พร้อมตอบ 24 ชม.</div>
        </div>
        <a href="/admin" className="text-xs bg-white/20 px-2 py-1 rounded">Login</a>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#8fb8d4]">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
            {m.role === "shop" && (
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mr-2 self-end font-bold">🤖</div>
            )}
            <div className={`max-w-[78%] ${m.role === "me" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-line shadow ${m.role === "me" ? "bg-emerald-400 text-black rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm"}`}>
                {m.text}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.products.map(p => (
                    <Link key={p.id} href={`/shop?product=${p.id}`} className="bg-white border-2 border-emerald-400 rounded-xl px-3 py-2 text-xs shadow hover:bg-emerald-50">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-emerald-600 font-bold">฿{p.price.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-700 mt-0.5">กดเพื่อสั่ง →</div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-white/80 mt-0.5 px-1">{m.time}</div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center mr-2 self-end font-bold">🤖</div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 text-sm shadow">
              <span className="inline-block animate-pulse">● ● ●</span>
            </div>
          </div>
        )}
      </div>

      {menuOpen ? (
        <div className="bg-white border-t shadow-2xl">
          <div className="grid grid-cols-2 gap-2 p-3">
            {RICH_MENU.map(b => (
              <Link key={b.title} href={b.href} className={`bg-gradient-to-br ${b.color} text-white rounded-2xl py-4 px-3 text-left active:scale-95 transition shadow`}>
                <div className="text-3xl mb-1">{b.icon}</div>
                <div className="text-sm font-bold leading-tight">{b.title}</div>
                <div className="text-[10px] opacity-90 leading-tight mt-0.5">{b.sub}</div>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border-t bg-gray-50">
            <button onClick={() => { setMenuOpen(false); setTimeout(() => inputRef.current?.focus(), 100); }} className="w-9 h-9 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300" title="พิมพ์ข้อความ">⌨️</button>
            <button onClick={() => setMenuOpen(false)} className="flex-1 text-gray-700 text-sm font-bold py-2 text-center hover:bg-gray-100 rounded">Menu ▼ (กดเพื่อแชทกับ AI)</button>
          </div>
        </div>
      ) : (
        <div className="bg-white border-t">
          <div className="flex items-center gap-2 p-2">
            <button onClick={() => setMenuOpen(true)} className="w-10 h-10 rounded-md bg-gray-200 text-gray-700 flex items-center justify-center" title="เปิดเมนู">▲</button>
            <input ref={inputRef} value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="ถาม AI หาสินค้า..." disabled={sending} className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none disabled:opacity-50"/>
            <button onClick={send} disabled={!msg.trim() || sending} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center disabled:opacity-50">{sending ? "..." : "➤"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
