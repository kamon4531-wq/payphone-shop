import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, hashPassword } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

function genPassword(len = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < len; i++) {
    p += chars[Math.floor(Math.random() * chars.length)];
  }
  return p;
}

export async function POST(req: NextRequest) {
  const u = getUser(req);
  if (u?.role !== "owner") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = supabaseAdmin();
  const created: any[] = [];
  const skipped: string[] = [];

  // 1) Region Managers (R1-R4)
  for (const region of ["R1", "R2", "R3", "R4"]) {
    const username = `${region.toLowerCase()}mgr`;
    const { data: existing } = await admin.from("admin_users").select("id").eq("username", username).single();
    if (existing) { skipped.push(username); continue; }

    const password = genPassword(10);
    const hash = hashPassword(password);
    const { data, error } = await admin.from("admin_users").insert({
      username, password_hash: hash, role: "region_manager",
      region_code: region, full_name: `Region Manager ${region}`, enabled: true
    }).select().single();

    if (data) created.push({ username, password, role: "region_manager", region_code: region, full_name: data.full_name });
  }

  // 2) Branches (56)
  for (const b of BRANCHES) {
    const code = b.name.split(":")[0];
    const username = code.toLowerCase();
    const { data: existing } = await admin.from("admin_users").select("id").eq("username", username).single();
    if (existing) { skipped.push(username); continue; }

    const password = genPassword(10);
    const hash = hashPassword(password);
    const { data, error } = await admin.from("admin_users").insert({
      username, password_hash: hash, role: "branch",
      branch_code: code, region_code: b.region,
      full_name: b.name.split(":")[1] || b.name, enabled: true
    }).select().single();

    if (data) created.push({ 
      username, password, role: "branch", 
      branch_code: code, region_code: b.region, 
      full_name: data.full_name 
    });
  }

  return NextResponse.json({ created, skipped, total_created: created.length, total_skipped: skipped.length });
}
