import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export const maxDuration = 60;

// วันที่แบบ yyyyMMdd ตามเวลาไทย (UTC+7)
function ymd(d: Date) {
  const b = new Date(d.getTime() + 7 * 3600 * 1000);
  return `${b.getUTCFullYear()}${String(b.getUTCMonth() + 1).padStart(2, "0")}${String(b.getUTCDate()).padStart(2, "0")}`;
}
function curYm() {
  const b = new Date(Date.now() + 7 * 3600 * 1000);
  return `${b.getUTCFullYear()}-${String(b.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ดึงยอดเพื่อนสะสม ณ วันที่กำหนดจาก LINE Insight
async function followersOn(token: string, dateYmd: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.line.me/v2/bot/insight/followers?date=${dateYmd}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const d = await r.json();
    if (d.status !== "ready") return null;
    return typeof d.followers === "number" ? d.followers : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  const admin = supabaseAdmin();

  const { data: branches } = await admin
    .from("branch_line_settings")
    .select("branch_code, channel_access_token");

  const ym = curYm();
  const now = Date.now();
  const y1 = new Date(now - 1 * 86400000);
  const y2 = new Date(now - 2 * 86400000);
  const bkk = new Date(now + 7 * 3600 * 1000);
  const prevMonthEnd = new Date(Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth(), 0));

  const results: any[] = [];
  for (const b of branches || []) {
    if (!b.channel_access_token) { results.push({ branch: b.branch_code, skip: "no token" }); continue; }
    let total = await followersOn(b.channel_access_token, ymd(y1));
    if (total == null) total = await followersOn(b.channel_access_token, ymd(y2));
    if (total == null) { results.push({ branch: b.branch_code, skip: "no data" }); continue; }

    const prev = await followersOn(b.channel_access_token, ymd(prevMonthEnd));
    const monthNew = prev != null ? Math.max(0, total - prev) : null;

    await admin.from("monthly_stats").upsert(
      { branch_code: b.branch_code, ym, line_total: total, ...(monthNew != null ? { line_friends: monthNew } : {}) },
      { onConflict: "branch_code,ym" }
    );
    results.push({
