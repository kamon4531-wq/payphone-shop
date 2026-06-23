import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from("branch_line_settings")
    .select("*")
    .order("branch_code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  const body = await req.json();
  if (!body.branch_code || !body.channel_access_token) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  
  const { data, error } = await supabaseAdmin()
    .from("branch_line_settings")
    .upsert({
      branch_code: body.branch_code,
      channel_access_token: body.channel_access_token,
      recipient_id: body.recipient_id || null,
      enabled: body.enabled !== false,
      notes: body.notes || null,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ setting: data });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "no" }, { status: 401 });
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
  
  const { error } = await supabaseAdmin()
    .from("branch_line_settings")
    .delete()
    .eq("branch_code", code);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
