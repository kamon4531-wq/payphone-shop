import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const branch = req.nextUrl.searchParams.get("branch");
  const phone = req.nextUrl.searchParams.get("phone");
  if (!branch || !phone) return NextResponse.json({ error: "missing" }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("chat_messages")
    .select("*")
    .eq("branch_code", branch)
    .eq("customer_phone", phone)
    .order("created_at", { ascending: true });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.branch_code || !body.customer_phone || !body.message || !body.sender) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  if (body.sender === "staff") {
    const user = getUser(req);
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin().from("chat_messages").insert({
    branch_code: body.branch_code,
    customer_phone: body.customer_phone,
    customer_name: body.customer_name || null,
    sender: body.sender,
    message: body.message
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
