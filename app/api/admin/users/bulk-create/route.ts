import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, hashPassword } from "@/lib/auth";
import { BRANCHES } from "@/lib/types";

function genPassword(len = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

async function upsertUser(admin: any, user: any, mode: string) {
  const password = genPassword(10);
  const hash = hashPassword(password);
  const { data: existing } = await admin.from("admin_users").select("id").eq("username", user.username).single();

  if (existing) {
    if (mode === "reset") {
      await admin.from("admin_users").update({ password_hash: hash, enabled: true }).eq("id", existing.id);
      return { ...user, password, status: "reset" };
    }
    return { ...user, password: "(ไม่เปลี่ยน)", status: "exists" };
  }
  await admin.from("admin_users").insert({ ...user, password_hash: hash, enabled: true });
  return { ...user, password, status: "created" };
}

export async function POST(req: NextRequest) {
  const u = getUser(req);
  if (u?.role !== "owner") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const mode = body.mode || "create";

  const admin = supabaseAdmin();
  const result: any[] = [];

  // 1) HQ Admin
  result.push(await upsertUser(admin, {
    username: "hq", role: "hq_admin",
    branch_code: null, region_code: null, full_name: "HQ Admin (ผู้บริหาร)"
  }, mode));

  // 2) Region Managers
  for (const region of ["R1", "R2", "R3", "R4"]) {
    result.push(await upsertUser(admin, {
      username: `${region.toLowerCase()}mgr`, role: "region_manager",
      branch_code: null, region_code: region, full_name: `Region Manager ${region}`
    }, mode));
  }

  // 3) Branches
  for (const b of BRANCHES) {
    const code = b.name.split(":")[0];
    result.push(await upsertUser(admin, {
      username: code.toLowerCase(), role: "branch",
      branch_code: code, region_code: b.region, full_name: b.name.split(":")[1] || b.name
    }, mode));
  }

  return NextResponse.json({ result, total: result.length });
}
