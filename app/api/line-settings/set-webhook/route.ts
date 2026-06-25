import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

const BASE_URL = "https://payphone-shop.vercel.app";

async function setWebhook(branch: string, token: string) {
  const endpoint = `${BASE_URL}/api/line/webhook/${branch}`;

  // 1) Set webhook URL
  const r1 = await fetch("https://api.line.me/v2/bot/channel/webhook/endpoint", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ endpoint })
  });

  if (!r1.ok) {
    const t = await r1.text();
    return { ok: false, branch, error: `SET ${r1.status}: ${t}` };
  }

  // 2) Test webhook
  const r2 = await fetch("https://api.line.me/v2/bot/channel/webhook/test", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ endpoint })
  });

  let testResult: any = null;
  try { testResult = await r2.json(); } catch {}

  return { ok: true, branch, endpoint, test: testResult };
}

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
  if (!data || data.length === 0) return NextResponse.json({ error: "no branches found" }, { status: 404 });

  const results = [];
  for (const row of data) {
    if (!row.channel_access_token) {
      results.push({ ok: false, branch: row.branch_code, error: "no token" });
      continue;
    }
    const r = await setWebhook(row.branch_code, row.channel_access_token);
    results.push(r);
  }

  const success = results.filter(r => r.ok).length;
  const failed = results.length - success;
  return NextResponse.json({ ok: true, total: results.length, success, failed, results });
}
