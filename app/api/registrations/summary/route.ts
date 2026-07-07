import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month"); // รูปแบบ "YYYY-MM"
  let since: string, until: string;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    // ขอบเขตเดือนตามเวลาไทย (UTC+7): เที่ยงคืนไทย = 17:00 UTC ของวันก่อนหน้า
    since = new Date(Date.UTC(y, m - 1, 1, -7)).toISOString();
    until = new Date(Date.UTC(y, m, 1, -7)).toISOString();
  } else {
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
    since = new Date(Date.now() - days * 86400000).toISOString();
    until = new Date(Date.now() + 86400000).toISOString();
  }

  const [regRes, lineRes] = await Promise.all([
    supabaseAdmin().from("register_clicks").select("branch_code").gte("clicked_at", since).lt("clicked_at", until),
    supabaseAdmin().from("line_follows").select("branch_code").eq("event_type", "follow").gte("created_at", since).lt("created_at", until)
  ]);

  const counts: Record<string, { register: number; line: number }> = {};

  regRes.data?.forEach((r: any) => {
    if (!counts[r.branch_code]) counts[r.branch_code] = { register: 0, line: 0 };
    counts[r.branch_code].register += 1;
  });

  lineRes.data?.forEach((r: any) => {
    if (!counts[r.branch_code]) counts[r.branch_code] = { register: 0, line: 0 };
    counts[r.branch_code].line += 1;
  });

  const result = Object.entries(counts)
    .map(([branch_code, c]) => ({
      branch_code,
      register: c.register,
      line: c.line,
      count: c.register + c.line
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(result);
}
