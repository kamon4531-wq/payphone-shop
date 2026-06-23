import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, canSeeAllBranches } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();
  let query = admin.from("orders").select("*").order("created_at", { ascending: false });

  // Filter ตาม role
  if (!canSeeAllBranches(user.role)) {
    if (user.role === "branch" && user.branch_code) {
      query = query.like("branch", `${user.branch_code}:%`);
    } else if (user.role === "region_manager" && user.region_code) {
      const branchPrefixes = BRANCHES
        .filter(b => b.region === user.region_code)
        .map(b => b.name.split(":")[0]);
      if (branchPrefixes.length === 0) {
        return NextResponse.json({ orders: [] });
      }
      const orClause = branchPrefixes.map(p => `branch.like.${p}:%`).join(",");
      query = query.or(orClause);
    } else {
      return NextResponse.json({ orders: [] });
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data });
}
