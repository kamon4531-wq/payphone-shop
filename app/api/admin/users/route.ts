import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, hashPassword } from "@/lib/auth";

function requireOwner(req: NextRequest) {
  const u = getUser(req);
  return u?.role === "owner";
}

export async function GET(req: NextRequest) {
  if (!requireOwner(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select("id, username, role, branch_code, region_code, full_name, email, enabled, created_at, last_login_at")
    .order("role").order("username");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(req: NextRequest) {
  if (!requireOwner(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.username || !body.password || !body.role) {
    return NextResponse.json({ error: "missing" }, { status: 400 });
  }

  const insert: any = {
    username: body.username.toLowerCase().trim(),
    password_hash: hashPassword(body.password),
    role: body.role,
    branch_code: body.branch_code || null,
    region_code: body.region_code || null,
    full_name: body.full_name || null,
    email: body.email || null,
    enabled: body.enabled !== false
  };

  const { data, error } = await supabaseAdmin().from("admin_users").insert(insert).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}

export async function PUT(req: NextRequest) {
  if (!requireOwner(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const update: any = {
    role: body.role,
    branch_code: body.branch_code || null,
    region_code: body.region_code || null,
    full_name: body.full_name || null,
    email: body.email || null,
    enabled: body.enabled !== false
  };
  if (body.password) update.password_hash = hashPassword(body.password);

  const { error } = await supabaseAdmin().from("admin_users").update(update).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireOwner(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await supabaseAdmin().from("admin_users").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
