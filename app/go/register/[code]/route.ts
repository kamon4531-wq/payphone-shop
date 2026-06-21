import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  
  await supabaseAdmin.from("register_clicks").insert({
    branch_code: code,
    ip: req.headers.get("x-forwarded-for") || "unknown",
    user_agent: req.headers.get("user-agent") || "unknown"
  });
  
  return NextResponse.redirect(`http://183.88.225.82:81/PAMember/register/${code}`);
}
