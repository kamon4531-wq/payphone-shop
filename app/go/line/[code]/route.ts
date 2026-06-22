import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { BRANCHES } from "@/lib/types";

const FALLBACK_LINE_OA = "@050hfvcn";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  
  await supabaseAdmin().from("line_clicks").insert({
    branch_code: code,
    ip: req.headers.get("x-forwarded-for") || "unknown",
    user_agent: req.headers.get("user-agent") || "unknown"
  });
  
  const branch = BRANCHES.find(b => b.name.startsWith(code + ":"));
  const lineOaId = branch?.line_oa_id || FALLBACK_LINE_OA;
  return NextResponse.redirect(`https://line.me/R/ti/p/${lineOaId}`);
}
