"use client";
import { useEffect, useRef, useState } from "react";

type Conv = {
  branch_code: string;
  customer_phone: string;
  customer_name: string;
  last_message: string;
  last_sender: string;
  last_at: string;
  count: number;
};

type Msg = {
  id: number;
  sender: "customer" | "staff";
  message: string;
  created_at: string;
};

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const r = await fetch("/api/chat/conversations");
    const d = await r.json();
    setConversations(d.conversations || []);
  }

  async function loadMessages() {
    if (!selected) return;
    const r = await fetch(`/api/chat/messages?branch=${selected.branch_code}&phone=${selected.customer_phone}`);
    const d = await r.json();
    setMessages(d.messages || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  useEffect(() => {
    loadConversations();
    let i: any = null;
    const start = () => { if (!i) i = setInterval(loadConversations, 30000); };
    const stop = () => { if (i) { clearInterval(i); i = null; } };
    const onVis = () => { if (document.hidden) stop(); else { loadConversations(); start(); } };
    if (typeof document !== "undefined" && !document.hidden) start();
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    loadMessages();
    if (!selected) return;
    let i: any = null;
    const start = () => { if (!i) i = setInterval(loadMessages, 15000); };
    const stop = () => { if (i) { clearInterval(i); i = null; } };
    const onVis = () => { if (document.hidden) stop(); else { loadMessages(); start(); } };
    if (typeof document !== "undefined" && !document.hidden) start();
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); document.removeEventListener("visibilitychange", onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending || !selected) return;
    setSending(true);
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch_code: selected.branch_code,
        customer_phone: selected.customer_phone,
        customer_name: selected.customer_name,
        sender: "staff",
        message: input.trim()
      })
    });
    setInput("");
    setSending(false);
    loadMessages();
    loadConversations();
  }

  return (
    <main className="h-screen flex flex-col">
      <header className="bg-white border-b p-3 flex justify-between items-center">
        <h1 className="font-bold">💬 แชทกับลูกค้า</h1>
        <a href="/admin" className="text-sm text-emerald-600 hover:underline">← Admin</a>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${selected ? "hidden md:block" : "block"} w-full md:w-80 border-r bg-white overflow-y-auto`}>
          <div className="p-3 border-b text-xs text-gray-500">{conversations.length} บทสนทนา</div>
          {conversations.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">ยังไม่มีลูกค้าทักเข้ามา</div>
          )}
          {conversations.map(c => (
            <button key={`${c.branch_code}-${c.customer_phone}`}
              onClick={() => setSelected(c)}
              className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                selected?.customer_phone === c.customer_phone && selected?.branch_code === c.branch_code ? "bg-cyan-50" : ""
              }`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500">
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">{c.branch_code}</span>
                  </div>
                  <div className="font-semibold text-sm mt-1">{c.customer_name || "ไม่ระบุชื่อ"}</div>
                  <div className="text-xs text-gray-500">{c.customer_phone}</div>
                  <div className="text-xs text-gray-600 mt-1 truncate">
                    {c.last_sender === "staff" && "✓ "}{c.last_message}
                  </div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(c.last_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="bg-cyan-500 text-white p-3 flex items-center gap-2">
              <button onClick={() => setSelected(null)} className="md:hidden">←</button>
              <div className="flex-1">
                <div className="font-bold">{selected.customer_name || selected.customer_phone}</div>
                <div className="text-xs opacity-80">{selected.branch_code} · {selected.customer_phone}</div>
              </div>
              <a href={`tel:${selected.customer_phone}`} className="bg-white/20 px-3 py-1 rounded text-sm">📞</a>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === "staff" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    m.sender === "staff" 
                      ? "bg-cyan-500 text-white rounded-br-sm" 
                      : "bg-white shadow rounded-bl-sm"
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                    <div className={`text-xs mt-1 ${m.sender === "staff" ? "text-cyan-100" : "text-gray-400"}`}>
                      {new Date(m.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef}></div>
            </div>

            <form onSubmit={send} className="bg-white p-3 border-t flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความตอบลูกค้า..."
                className="flex-1 border rounded-full px-4 py-2"/>
              <button disabled={sending || !input.trim()}
                className="bg-cyan-500 disabled:opacity-50 text-white px-5 py-2 rounded-full font-semibold">
                ส่ง
              </button>
            </form>
          </div>
        )}

        {!selected && conversations.length > 0 && (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
            เลือกบทสนทนาจากด้านซ้าย
          </div>
        )}
      </div>
    </main>
  );
}
