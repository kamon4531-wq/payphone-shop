import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString();
  
  const [regRes, lineRes] = await Promise.all([
    supabaseAdmin().from("register_clicks").select("branch_code").gte("clicked_at", since),
    supabaseAdmin().from("line_clicks").select("branch_code").gte("clicked_at", since)
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
