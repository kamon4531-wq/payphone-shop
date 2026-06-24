"use client";
import Link from "next/link";

const BUTTONS = [
  { 
    title: "ดูสินค้า", sub: "เลือกซื้อสินค้าได้ที่นี่",
    href: "/shop", color: "from-emerald-400 to-green-500",
    icon: "🛒"
  },
  { 
    title: "สมัครสมาชิก", sub: "สมัครง่าย ได้สิทธิพิเศษมากมาย",
    href: "/branches", color: "from-blue-500 to-blue-700",
    icon: "👤"
  },
  { 
    title: "โปรโมชั่น", sub: "ดีลเด็ด ส่วนลดพิเศษ",
    href: "/shop", color: "from-orange-400 to-orange-600",
    icon: "🎁"
  },
  { 
    title: "ออเดอร์ของฉัน", sub: "เช็คสถานะคำสั่งซื้อ",
    href: "/track", color: "from-purple-500 to-purple-700",
    icon: "📦"
  },
  { 
    title: "หาสาขา", sub: "ค้นหาสาขาใกล้คุณ",
    href: "/branches", color: "from-pink-500 to-rose-600",
    icon: "📍"
  },
  { 
    title: "ติดต่อสอบถาม", sub: "แชทสอบถาม 24 ชั่วโมง",
    href: "/contact", color: "from-cyan-500 to-teal-600",
    icon: "💬"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Logo */}
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="PAY BY PA.PHONE" 
            className="mx-auto w-48 h-48 object-contain"/>
          <p className="text-sm text-gray-500 mt-2">แหล่งรวมอุปกรณ์มือถือที่ดีที่สุด</p>
        </div>

        {/* 6 Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {BUTTONS.map(b => (
            <Link key={b.title} href={b.href}
              className={`relative bg-gradient-to-br ${b.color} rounded-2xl p-5 sm:p-6 shadow-lg active:scale-95 transition-transform`}>
              <div className="text-5xl mb-2">{b.icon}</div>
              <div className="text-white font-bold text-lg">{b.title}</div>
              <div className="text-white/80 text-xs mt-1">{b.sub}</div>
            </Link>
          ))}
        </div>

        {/* Admin Link */}
        <div className="text-center mt-8">
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
            เข้าสู่ระบบ Admin
          </a>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-6 py-4">
          © PAY BY PA.PHONE
        </footer>
      </div>
    </main>
  );
}
