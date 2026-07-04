import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

// Thai timezone (UTC+7) helpers
function monthRange(monthStr: string): { since?: string; until?: string } {
  if (!monthStr || monthStr === "all") return {};
  const m = /^(\d{4})-(\d{2})$/.exec(monthStr);
  if (!m) return {};
  const y = parseInt(m[1]);
  const mo = parseInt(m[2]);
  // Start of month in Thai time (UTC+7) → UTC = Thai - 7h
  // So 1st of month 00:00 Thai = previous day 17:00 UTC
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

  if (monthParam) {
    const range = monthRange(monthParam);
    since = range.since;
    until = range.until;
  } else {
    since = new Date(Date.now() - days * 86400000).toISOString();
  }

  const applyRange = (q: any) => {
    if (since) q = q.gte("clicked_at", since);
    if (until) q = q.lt("clicked_at", until);
    return q;
  };

  const [regRes, lineRes] = await Promise.all([
    applyRange(supabaseAdmin().from("register_clicks").select("branch_code")),
    applyRange(supabaseAdmin().from("line_clicks").select("branch_code"))
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
