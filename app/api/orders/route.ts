import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.product_id || !body.customer_name || !body.phone) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1).toISOString();

  const { count } = await admin.from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay)
    .lt("created_at", endOfDay);

  const orderNumber = `ORD-${dateStr}-${String((count || 0) + 1).padStart(4, '0')}`;

  const { data, error } = await admin.from("orders").insert({
    product_id: body.product_id,
    product_name: body.product_name,
    customer_name: body.customer_name,
    phone: body.phone,
    address: body.address || null,
    province: body.province || null,
    branch: body.branch || null,
    price: body.price,
    slip_url: body.slip_url || null,
    slip_id: body.slip_id || null,
    transfer_time: body.transfer_time || null,
    order_number: orderNumber
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  const action = req.nextUrl.searchParams.get("action");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (action === "clear-slip") {
    const { error } = await supabaseAdmin().from("orders")
      .update({ slip_url: null, slip_id: null }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseAdmin().from("orders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
