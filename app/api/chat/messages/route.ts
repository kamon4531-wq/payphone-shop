"use client";
import { useEffect, useRef, useState } from "react";
import { BRANCHES } from "@/lib/types";

type Msg = {
  id: number;
  sender: "customer" | "staff";
  message: string;
  created_at: string;
};

export default function ContactPage() {
  const [step, setStep] = useState<"setup" | "chat">("setup");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const branchCode = branch.split(":")[0];

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("chatSetup") : null;
    if (saved) {
      const s = JSON.parse(saved);
      setBranch(s.branch); setPhone(s.phone); setName(s.name);
      setStep("chat");
    }
  }, []);

  async function loadMessages() {
    if (!branchCode || !phone) return;
    const r = await fetch(`/api/chat/messages?branch=${branchCode}&phone=${phone}`);
    const d = await r.json();
    setMessages(d.messages || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  useEffect(() => {
    if (step !== "chat") return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, branchCode, phone]);

  function startChat(e: React.FormEvent) {
    e.preventDefault();
    if (!branch || !phone) return;
    localStorage.setItem("chatSetup", JSON.stringify({ branch, phone, name }));
    setStep("chat");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch_code: branchCode,
        customer_phone: phone,
        customer_name: name,
        sender: "customer",
        message: input.trim()
      })
    });
    setInput("");
    setSending(false);
    loadMessages();
  }

  function reset() {
    localStorage.removeItem("chatSetup");
    setStep("setup");
    setMessages([]);
  }

  if (step === "setup") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 p-4">
        <div className="max-w-md mx-auto">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">💬 ติดต่อสอบถาม</h1>
            <a href="/" className="text-sm text-emerald-600">← หน้าหลัก</a>
          </header>

          <form onSubmit={startChat} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div>
              <label className="text-sm font-semibold">ชื่อ-นามสกุล *</label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="ชื่อ-นามสกุล"/>
            </div>
            <div>
              <label className="text-sm font-semibold">เบอร์โทร *</label>
              <input required value={phone} onChange={e => setPhone(e.target.value)}
                pattern="[0-9]{9,10}" inputMode="numeric"
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="0XXXXXXXXX"/>
            </div>
            <div>
              <label className="text-sm font-semibold">เลือกสาขา *</label>
              <select required value={branch} onChange={e => setBranch(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1">
                <option value="">เลือกสาขาที่ต้องการสอบถาม</option>
                {BRANCHES.map(b => (
                  <option key={b.name} value={b.name}>{b.region} · {b.name}</option>
                ))}
              </select>
            </div>
            <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg">
              เริ่มแชท
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-gray-50">
      <header className="bg-cyan-500 text-white p-4 shadow flex items-center justify-between">
        <div>
          <div className="text-xs opacity-80">{branchCode}</div>
          <div className="font-bold">{branch.split(":")[1] || branch}</div>
        </div>
        <button onClick={reset} className="text-xs underline">เปลี่ยนสาขา</button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            ยังไม่มีข้อความ — เริ่มทักได้เลย
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              m.sender === "customer" 
                ? "bg-cyan-500 text-white rounded-br-sm" 
                : "bg-white shadow rounded-bl-sm"
            }`}>
              <div className="text-sm">{m.message}</div>
              <div className={`text-xs mt-1 ${m.sender === "customer" ? "text-cyan-100" : "text-gray-400"}`}>
                {new Date(m.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <form onSubmit={send} className="bg-white p-3 shadow-lg border-t flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 border rounded-full px-4 py-2"/>
        <button disabled={sending || !input.trim()}
          className="bg-cyan-500 disabled:opacity-50 text-white px-5 py-2 rounded-full font-semibold">
          ส่ง
        </button>
      </form>
    </main>
  );
}
