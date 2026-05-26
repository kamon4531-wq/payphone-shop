"use client";
import { useEffect, useState } from "react";
import { Product, Order, CATEGORIES } from "@/lib/types";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/admin/me").then(r => setAuthed(r.ok));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    });
    if (r.ok) setAuthed(true); else setErr("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }

  if (authed === null) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={login} className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-3">
        <h1 className="text-xl font-bold text-center">เข้าสู่ระบบ Admin</h1>
        <input value
