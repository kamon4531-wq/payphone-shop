import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.product_id || !body.customer_name || !body.phone) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin().from("orders").insert({
    product_id: body.product_id,
    product_name: body.product_name,
    customer_name: body.customer_name,
    phone: body.phone,
    address: body.address || null,
    province: body.province || null,
    price: body.price,
    slip_url: body.slip_url || null,
    slip_id: body.slip_id || null,
    transfer_time: body.transfer_time || null
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
