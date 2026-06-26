"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BRANCHES } from "@/lib/types";

type Msg = {
  id: number;
  sender: "customer" | "staff";
  message: string;
  created_at: string;
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chatSessionId");
  if (!id) {
    id = "C" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("chatSessionId", id);
  }
  return id;
}

export default function ContactPage() {
  const [step, setStep] = useState<"setup" | "chat">("setup");
  const [branch, setBranch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const branchCode = branch.split(":")[0];

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    const saved = typeof window !== "undefined" ? localStorage.getItem("chatSetup") : null;
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.branch) { setBranch(s.branch); setBranchSearch(s.branch); }
        if (s.name) setName(s.name);
        if (s.branch) setStep("chat");
      } catch {}
    }
  }, []);

  const filteredBranches = useMemo(() => {
    if (!branchSearch) return BRANCHES;
    const q = branchSearch.toLowerCase();
    return BRANCHES.filter(b => b.name.toLowerCase().includes(q));
  }, [branchSearch]);

  async function loadMessages() {
    if (!branchCode || !sessionId) return;
    const r = await fetch(`/api/chat/messages?branch=${branchCode}&phone=${encodeURIComponent(sessionId)}`);
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
  }, [step, branchCode, sessionId]);

  function startChat(e: React.FormEvent) {
    e.preventDefault();
    if (!branch || !name) return;
    localStorage.setItem("chatSetup", JSON.stringify({ branch, name }));
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
        customer_phone: sessionId,
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

  function selectBranch(n: string) {
    setBranch(n);
    setBranchSearch(n);
    setBranchOpen(false);
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
              <label className="text-sm font-semibold">ชื่อ <span className="text-red-500">*</span></label>
              <input required value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="กรอกชื่อของคุณ"/>
            </div>
            <div className="relative">
              <label className="text-sm font-semibold">เลือกสาขา <span className="text-red-500">*</span></label>
              <input type="text" value={branchSearch}
                onChange={e => { setBranchSearch(e.target.value); setBranch(""); setBranchOpen(true); }}
                onFocus={() => setBranchOpen(true)}
                onBlur={() => setTimeout(() => setBranchOpen(false), 200)}
                className="w-full border rounded-lg p-2 mt-1"
                placeholder="🔍 พิมพ์ชื่อสาขาเพื่อค้นหา"/>
              {branchOpen && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg z-20">
                  {filteredBranches.length > 0 ? filteredBranches.map(b => (
                    <div key={b.name}
                      onMouseDown={() => selectBranch(b.name)}
                      className="p-2 text-sm hover:bg-cyan-50 cursor-pointer border-b">
                      <span className="text-xs text-gray-500 mr-2">{b.region}</span>{b.name}
                    </div>
                  )) : (
                    <div className="p-3 text-sm text-gray-500 text-center">ไม่พบสาขา</div>
                  )}
                </div>
              )}
              {branch && <div className="text-xs text-cyan-600 mt-1">✓ {branch}</div>}
            </div>
            <button disabled={!branch || !name} className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg">
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
          <div className="text-xs opacity-80">{branchCode} · {name}</div>
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
