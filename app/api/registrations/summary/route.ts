import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString();
  
  const { data } = await supabaseAdmin()
    .from("register_clicks")
    .select("branch_code")
    .gte("clicked_at", since);
  
  const counts: Record<string, number> = {};
  data?.forEach((r: any) => {
    counts[r.branch_code] = (counts[r.branch_code] || 0) + 1;
  });
  
  const result = Object.entries(counts)
    .map(([branch_code, count]) => ({ branch_code, count }))
    .sort((a, b) => b.count - a.count);
  
  return NextResponse.json(result);
}
