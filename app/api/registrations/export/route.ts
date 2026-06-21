import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  
  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString();
  
  const { data } = await supabaseAdmin()
    .from("register_clicks")
    .select("*")
    .gte("clicked_at", since)
    .order("clicked_at", { ascending: false });
  
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
      "Content-Disposition": `attachment; filename="registrations-${days}days.csv"`
    }
  });
}
