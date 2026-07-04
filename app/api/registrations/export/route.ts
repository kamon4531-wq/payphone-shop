import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

// Thai timezone (UTC+7) month range helper
function monthRange(monthStr: string): { since?: string; until?: string } {
  if (!monthStr || monthStr === "all") return {};
  const m = /^(\d{4})-(\d{2})$/.exec(monthStr);
  if (!m) return {};
  const y = parseInt(m[1]);
  const mo = parseInt(m[2]);
  const since = new Date(Date.UTC(y, mo - 1, 1, -7, 0, 0)).toISOString();
  const until = new Date(Date.UTC(y, mo, 1, -7, 0, 0)).toISOString();
  return { since, until };
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });

  const monthParam = req.nextUrl.searchParams.get("month");
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");

  let since: string | undefined;
  let until: string | undefined;
  let filenameSuffix: string;

  if (monthParam) {
    const range = monthRange(monthParam);
    since = range.since;
    until = range.until;
    filenameSuffix = monthParam === "all" ? "all" : monthParam;
  } else {
    since = new Date(Date.now() - days * 86400000).toISOString();
    filenameSuffix = `${days}days`;
  }

  let q: any = supabaseAdmin()
    .from("register_clicks")
    .select("*")
    .order("clicked_at", { ascending: false });
  if (since) q = q.gte("clicked_at", since);
  if (until) q = q.lt("clicked_at", until);

  const { data } = await q;

  const header = "วันที่,เวลา,รหัสสาขา,IP\n";
  const rows = (data || []).map((r: any) => {
    const d = new Date(r.clicked_at);
    const date = d.toLocaleDateString("th-TH");
    const time = d.toLocaleTimeString("th-TH");
    return `${date},${time},${r.branch_code},${r.ip || ""}`;
  }).join("\n");

  const csv = "\ufeff" + header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${filenameSuffix}.csv"`
    }
  });
}
