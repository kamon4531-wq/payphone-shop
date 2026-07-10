import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });

  const admin = supabaseAdmin();

  // คืนรายการเดือนที่มีข้อมูล (สำหรับดรอปดาวน์) + เดือนปัจจุบัน
  if (req.nextUrl.searchParams.get("list") === "months") {
    const { data } = await admin.from("monthly_stats").select("ym");
    const set = new Set<string>((data || []).map((r: any) => r.ym));
    const now = new Date();
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    const months = Array.from(set).sort().reverse();
    return NextResponse.json({ months });
  }

  const month = req.nextUrl.searchParams.get("month");

  const mk = (counts: Record<string, { register: number; line: number }>) =>
    Object.entries(counts)
      .map(([branch_code, c]) => ({ branch_code, register: c.register, line: c.line, count: c.register + c.line }))
      .sort((a, b) => b.count - a.count);

  // === โหมด "ทั้งหมด": รวมข้อมูลที่อัปโหลด (manual) ทุกเดือน ===
  if (month === "all" || !month) {
    const { data: ms } = await admin.from("monthly_stats").select("branch_code, members, line_friends");
    const counts: Record<string, { register: number; line: number }> = {};
    (ms || []).forEach((r: any) => {
      if (!counts[r.branch_code]) counts[r.branch_code] = { register: 0, line: 0 };
      counts[r.branch_code].register += r.members || 0;
      counts[r.branch_code].line += r.line_friends || 0;
    });
    return NextResponse.json(mk(counts));
  }

  // === เดือนเจาะจง ===
  if (/^\d{4}-\d{2}$/.test(month)) {
    // 1) มีข้อมูลอัปโหลด (manual) -> ใช้ตัวเลขจริงจาก HQ
    const { data: ms } = await admin.from("monthly_stats").select("branch_code, members, line_friends").eq("ym", month);
    if (ms && ms.length > 0) {
      const counts: Record<string, { register: number; line: number }> = {};
      ms.forEach((r: any) => { counts[r.branch_code] = { register: r.members || 0, line: r.line_friends || 0 }; });
      return NextResponse.json(mk(counts));
    }
    // 2) ไม่มี manual -> นับอัตโนมัติจากคลิก/ผู้ติดตาม
    const [y, m] = month.split("-").map(Number);
    const since = new Date(Date.UTC(y, m - 1, 1, -7)).toISOString();
    const until = new Date(Date.UTC(y, m, 1, -7)).toISOString();
    const [regRes, lineRes] = await Promise.all([
      admin.from("register_clicks").select("branch_code").gte("clicked_at", since).lt("clicked_at", until),
      admin.from("line_follows").select("branch_code").eq("event_type", "follow").gte("created_at", since).lt("created_at", until)
    ]);
    const counts: Record<string, { register: number; line: number }> = {};
    regRes.data?.forEach((r: any) => { if (!counts[r.branch_code]) counts[r.branch_code] = { register: 0, line: 0 }; counts[r.branch_code].register += 1; });
    lineRes.data?.forEach((r: any) => { if (!counts[r.branch_code]) counts[r.branch_code] = { register: 0, line: 0 }; counts[r.branch_code].line += 1; });
    return NextResponse.json(mk(counts));
  }

  return NextResponse.json([]);
}
