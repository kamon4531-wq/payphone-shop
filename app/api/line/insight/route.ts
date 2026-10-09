import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export const maxDuration = 60;

// Date -> yyyyMMdd ตามเวลาไทย (UTC+7)
function ymd(d: Date) {
  const b = new Date(d.getTime() + 7 * 3600 * 1000);
  return `${b.getUTCFullYear()}${String(b.getUTCMonth() + 1).padStart(2, "0")}${String(b.getUTCDate()).padStart(2, "0")}`;
}

// ดึงยอดเพื่อนสะสม (followers) ของวันที่ระบุ จาก LINE Insight
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

const MONTHS_BACK = 6; // เดือนปัจจุบัน + ย้อนหลัง 5 เดือน

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  const admin: any = supabaseAdmin();

  const { data: branches } = await admin
    .from("branch_line_settings")
    .select("branch_code, channel_access_token");

  const now = Date.now();
  const bkk = new Date(now + 7 * 3600 * 1000);
  const curY = bkk.getUTCFullYear();
  const curM = bkk.getUTCMonth(); // 0-based
  const yest = new Date(now - 1 * 86400000 + 7 * 3600 * 1000); // เมื่อวาน (ข้อมูล LINE มีถึงเมื่อวาน)

  // สร้างรายการเดือนที่จะอัปเดต พร้อม "วัน snapshot" และ "สิ้นเดือนก่อนหน้า"
  const months: { ym: string; snap: Date; prevSnap: Date }[] = [];
  for (let i = 0; i < MONTHS_BACK; i++) {
    const d = new Date(Date.UTC(curY, curM - i, 1));
    const yy = d.getUTCFullYear();
    const mm = d.getUTCMonth();
    const ym = `${yy}-${String(mm + 1).padStart(2, "0")}`;
    // วันสุดท้ายของเดือน = วันที่ 0 ของเดือนถัดไป
    let snap = new Date(Date.UTC(yy, mm + 1, 0));
    // เดือนปัจจุบันที่ยังไม่จบ → ใช้เมื่อวาน
    if (yy === curY && mm === curM) {
      snap = new Date(Date.UTC(yest.getUTCFullYear(), yest.getUTCMonth(), yest.getUTCDate()));
    }
    const prevSnap = new Date(Date.UTC(yy, mm, 0)); // สิ้นเดือนก่อนหน้า
    months.push({ ym, snap, prevSnap });
  }

  // ทำทุกสาขาพร้อมกัน (ขนาน) — แต่ละสาขาวนทีละเดือน + cache ต่อวันกันเรียกซ้ำ
  const results = await Promise.all((branches || []).map(async (b: any) => {
    if (!b.channel_access_token) return { branch: b.branch_code, skip: "no token" };
    const token = b.channel_access_token;
    const cache: Record<string, number | null> = {};
    const get = async (dt: Date) => {
      const key = ymd(dt);
      if (!(key in cache)) cache[key] = await followersOn(token, key);
      return cache[key];
    };

    const rows: any[] = [];
    for (const mo of months) {
      const total = await get(mo.snap);
      if (total == null) { rows.push({ ym: mo.ym, skip: "no data" }); continue; }
      const prev = await get(mo.prevSnap);
      const monthNew = prev != null ? Math.max(0, total - prev) : null;
      await admin.from("monthly_stats").upsert(
        {
          branch_code: b.branch_code,
          ym: mo.ym,
          line_total: total,
          ...(monthNew != null ? { line_friends: monthNew } : {}),
        },
        { onConflict: "branch_code,ym" }
      );
      rows.push({ ym: mo.ym, total, monthNew });
    }
    return { branch: b.branch_code, rows };
  }));

  return NextResponse.json({ ok: true, monthsBack: MONTHS_BACK, results });
}

export function GET() {
  return NextResponse.json({ ok: true, info: "POST เพื่อดึงยอด Line OA ย้อนหลังจาก LINE Insight" });
}
