import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });

  const admin = supabaseAdmin();
  const month = req.nextUrl.searchParams.get("month");

  const counts: Record<string, { members: number; line: number }> = {};
  const add = (code: string, mem: number, ln: number) => {
    if (!counts[code]) counts[code] = { members: 0, line: 0 };
    counts[code].members += mem;
    counts[code].line += ln;
  };

  let tag = "all";

  if (!month || month === "all") {
    const { data: ms } = await admin.from("monthly_stats").select("branch_code, members, line_friends");
    (ms || []).forEach((r: any) => add(r.branch_code, r.members || 0, r.line_friends || 0));
  } else if (/^\d{4}-\d{2}$/.test(month)) {
    tag = month;
    const { data: ms } = await admin
      .from("monthly_stats")
      .select("branch_code, members, line_friends")
      .eq("ym", month);

    if (ms && ms.length > 0) {
      ms.forEach((r: any) => add(r.branch_code, r.members || 0, r.line_friends || 0));
    } else {
      const [y, m] = month.split("-").map(Number);
      const since = new Date(Date.UTC(y, m - 1, 1, -7)).toISOString();
      const until = new Date(Date.UTC(y, m, 1, -7)).toISOString();
      const [regRes, lineRes] = await Promise.all([
        admin.from("register_clicks").select("branch_code").gte("clicked_at", since).lt("clicked_at", until),
        admin.from("line_follows").select("branch_code").eq("event_type", "follow").gte("created_at", since).lt("created_at", until)
      ]);
      regRes.data?.forEach((r: any) => add(r.branch_code, 1, 0));
      lineRes.data?.forEach((r: any) => add(r.branch_code, 0, 1));
    }
  }

  const rows = BRANCHES.map(b => {
    const code = b.name.split(":")[0];
    const name = (b.name.split(":")[1] || b.name).replace(/[,\n]/g, " ");
    const c = counts[code] || { members: 0, line: 0 };
    return { code, name, region: b.region, members: c.members, line: c.line, total: c.members + c.line };
  }).sort((a, b) => b.total - a.total);

  const header = "รหัสสาขา,ชื่อสาขา,ภาค,สมาชิก,เพื่อน Line OA,รวม\n";
  const body = rows.map(r => `${r.code},${r.name},${r.region},${r.members},${r.line},${r.total}`).join("\n");
  const csv = "\ufeff" + header + body;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stats-${tag}.csv"`
    }
  });
}
