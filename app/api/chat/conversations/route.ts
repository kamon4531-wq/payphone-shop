import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, canSeeAllBranches } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  let query = admin.from("chat_messages")
    .select("branch_code, customer_phone, customer_name, message, created_at, sender")
    .order("created_at", { ascending: false });

  if (!canSeeAllBranches(user.role)) {
    if (user.role === "branch" && user.branch_code) {
      query = query.eq("branch_code", user.branch_code);
    } else if (user.role === "region_manager" && user.region_code) {
      const codes = BRANCHES.filter(b => b.region === user.region_code).map(b => b.name.split(":")[0]);
      query = query.in("branch_code", codes);
    } else {
      return NextResponse.json({ conversations: [] });
    }
  }

  const { data, error } = await query.limit(1000);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, any> = {};
  for (const m of data || []) {
    const key = `${m.branch_code}|${m.customer_phone}`;
    if (!map[key]) {
      map[key] = {
        branch_code: m.branch_code,
        customer_phone: m.customer_phone,
        customer_name: m.customer_name,
        last_message: m.message,
        last_sender: m.sender,
        last_at: m.created_at,
        count: 1
      };
    } else {
      map[key].count += 1;
    }
  }

  const conversations = Object.values(map).sort((a: any, b: any) => 
    new Date(b.last_at).getTime() - new Date(a.last_at).getTime()
  );

  return NextResponse.json({ conversations });
}
