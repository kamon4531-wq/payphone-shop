import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const BASE_URL = "https://payphone-shop.vercel.app";

// เช็กสถานะ webhook จริงจาก LINE: URL ตรงไหม + Use webhook เปิดอยู่ไหม
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetBranch: string | null = body.branch || null;

  const admin = supabaseAdmin();
  let query = admin.from("branch_line_settings").select("branch_code, channel_access_token");
  if (targetBranch) query = query.eq("branch_code", targetBranch.toUpperCase());

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "no branches" }, { status: 404 });

  const results: any[] = [];
  for (const row of data) {
    const expected = `${BASE_URL}/api/line/webhook/${row.branch_code}`;
    if (!row.channel_access_token) {
      results.push({ branch: row.branch_code, ok: false, active: false, urlMatch: false, note: "ไม่มี Token" });
      continue;
    }
    try {
      const r = await fetch("https://api.line.me/v2/bot/channel/webhook/endpoint", {
        headers: { Authorization: `Bearer ${row.channel_access_token}` }
      });
      if (!r.ok) {
        const t = await r.text();
        results.push({ branch: row.branch_code, ok: false, active: false, urlMatch: false, note: `LINE ${r.status}: ${t.slice(0, 90)}` });
        continue;
      }
      const d = await r.json();
      const active = !!d.active;
      const endpoint = d.endpoint || "";
      const urlMatch = endpoint === expected;
      let note = "";
      if (active && urlMatch) note = "พร้อมนับเพื่อน";
      else if (!active && urlMatch) note = "URL ถูก แต่ Use webhook = ปิด";
      else if (active && !urlMatch) note = `Use webhook เปิด แต่ URL ผิด: ${endpoint}`;
      else note = `ปิด + URL ผิด: ${endpoint}`;
      results.push({ branch: row.branch_code, ok: active && urlMatch, active, urlMatch, endpoint, note });
    } catch (e: any) {
      results.push({ branch: row.branch_code, ok: false, active: false, urlMatch: false, note: e.message || "network error" });
    }
  }

  return NextResponse.json({ ok: true, results });
}
