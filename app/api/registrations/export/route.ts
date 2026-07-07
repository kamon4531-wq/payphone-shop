import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });

  const month = req.nextUrl.searchParams.get("month");
  let since: string, until: string, tag: string;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    since = new Date(Date.UTC(y, m - 1, 1, -7)).toISOString();
    until = new Date(Date.UTC(y, m, 1, -7)).toISOString();
    tag = month;
  } else {
    const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
    since = new Date(Date.now() - days * 86400000).toISOString();
    until = new Date(Date.now() + 86400000).toISOString();
    tag = `${days}days`;
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

  const rows = BRANCHES.map(b => {
    const code = b.name.split(":")[0];
    const name = (b.name.split(":")[1] || b.name).replace(/[,\n]/g, " ");
    const c = counts[code] || { register: 0, line: 0 };
    return { code, name, region: b.region, register: c.register, line: c.line, total: c.register + c.line };
  }).sort((a, b) => b.total - a.total);

  const header = "รหัสสาขา,ชื่อสาขา,ภาค,คลิกสมัคร,เพื่อนLineจริง,รวม\n";
  const body = rows.map(r => `${r.code},${r.name},${r.region},${r.register},${r.line},${r.total}`).join("\n");
  const csv = "\ufeff" + header + body;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${tag}.csv"`
    }
  });
}
